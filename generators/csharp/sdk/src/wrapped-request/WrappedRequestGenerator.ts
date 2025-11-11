import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { ExampleGenerator, generateField, generateFieldForFileProperty } from "@fern-api/fern-csharp-model";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import {
    ContainerType,
    ExampleEndpointCall,
    HttpEndpoint,
    Name,
    SdkRequestWrapper,
    ServiceId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace WrappedRequestGenerator {
    export interface Args {
        serviceId: ServiceId;
        wrapper: SdkRequestWrapper;
        context: SdkGeneratorContext;
        endpoint: HttpEndpoint;
    }
}

/** Represents the request JSON object */
export class WrappedRequestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private wrapper: SdkRequestWrapper;
    private serviceId: ServiceId;
    private endpoint: HttpEndpoint;
    private exampleGenerator: ExampleGenerator;

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.wrapper = wrapper;
        this.serviceId = serviceId;
        this.classReference = this.context.common.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);

        this.endpoint = endpoint;
        this.exampleGenerator = new ExampleGenerator(context);
    }

    protected doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: false,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record,
            annotations: [this.extern.System.Serializable]
        });

        const service = this.context.common.getHttpServiceOrThrow(this.serviceId);
        const isProtoRequest = this.context.endpointUsesGrpcTransport(service, this.endpoint);
        const protobufProperties: { propertyName: string; typeReference: TypeReference }[] = [];

        if (this.context.includePathParametersInWrappedRequest({ endpoint: this.endpoint, wrapper: this.wrapper })) {
            for (const pathParameter of this.endpoint.allPathParameters) {
                class_.addField({
                    origin: pathParameter,
                    type: this.context.csharpTypeMapper.convert({ reference: pathParameter.valueType }),
                    access: ast.Access.Public,
                    get: true,
                    set: true,
                    summary: pathParameter.docs,
                    useRequired: true,
                    initializer: this.context.common.getLiteralInitializerFromTypeReference({
                        typeReference: pathParameter.valueType
                    }),
                    annotations: [this.extern.System.Text.Json.Serialization.JsonIgnore]
                });
            }
        }

        for (const query of this.endpoint.queryParameters) {
            const type = query.allowMultiple
                ? this.csharp.Type.list(
                      this.context.csharpTypeMapper.convert({
                          reference: query.valueType,
                          unboxOptionals: true
                      })
                  )
                : this.context.csharpTypeMapper.convert({ reference: query.valueType });
            const field = class_.addField({
                origin: query,
                type,
                access: ast.Access.Public,
                get: true,
                set: true,
                summary: query.docs,
                useRequired: true,
                initializer: this.context.common.getLiteralInitializerFromTypeReference({
                    typeReference: query.valueType
                }),
                annotations: [this.extern.System.Text.Json.Serialization.JsonIgnore]
            });

            if (isProtoRequest) {
                protobufProperties.push({
                    propertyName: field.name,
                    typeReference: query.allowMultiple
                        ? TypeReference.container(ContainerType.list(query.valueType))
                        : query.valueType
                });
            }
        }
        for (const header of [...service.headers, ...this.endpoint.headers]) {
            class_.addField({
                origin: header,
                type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
                access: ast.Access.Public,
                get: true,
                set: true,
                summary: header.docs,
                useRequired: true,
                initializer: this.context.common.getLiteralInitializerFromTypeReference({
                    typeReference: header.valueType
                }),
                annotations: [this.extern.System.Text.Json.Serialization.JsonIgnore]
            });
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                const type = this.context.csharpTypeMapper.convert({ reference: reference.requestBodyType });
                const useRequired = !type.isOptional;
                class_.addField({
                    origin: this.wrapper.bodyKey,
                    type,
                    access: ast.Access.Public,
                    get: true,
                    set: true,
                    summary: reference.docs,
                    useRequired,
                    annotations: [this.extern.System.Text.Json.Serialization.JsonIgnore]
                });
            },
            inlinedRequestBody: (request) => {
                for (const property of [...request.properties, ...(request.extendedProperties ?? [])]) {
                    const field = generateField(class_, {
                        property,
                        className: this.classReference.name,
                        context: this.context
                    });

                    if (isProtoRequest) {
                        protobufProperties.push({
                            propertyName: field.name,
                            typeReference: property.valueType
                        });
                    }
                }
            },
            fileUpload: (request) => {
                for (const property of request.properties) {
                    switch (property.type) {
                        case "bodyProperty":
                            generateField(class_, {
                                property,
                                className: this.classReference.name,
                                context: this.context,
                                jsonProperty: false
                            });

                            break;
                        case "file":
                            generateFieldForFileProperty(class_, {
                                property: property.value,
                                className: this.classReference.name,
                                context: this.context
                            });
                            break;
                    }
                }
            },
            bytes: () => undefined,
            _other: () => undefined
        });

        this.context.common.getToStringMethod(class_);

        if (isProtoRequest) {
            const protobufService = this.context.common.protobufResolver.getProtobufServiceForServiceId(this.serviceId);
            if (protobufService != null) {
                const protobufClassReference = this.csharp.classReference({
                    name: this.classReference.name,
                    namespace: this.context.common.protobufResolver.getNamespaceFromProtobufFileOrThrow(
                        protobufService.file
                    ),
                    namespaceAlias: "Proto"
                });
                this.context.common.csharpProtobufTypeMapper.toProtoMethod(class_, {
                    classReference: this.classReference,
                    protobufClassReference,
                    properties: protobufProperties
                });
            }
        }

        return new CSharpFile({
            clazz: class_,
            directory: this.getDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.common.namespaces.root,
            generation: this.context.common.generation
        });
    }

    public doGenerateSnippet({
        example,
        parseDatetimes
    }: {
        example: ExampleEndpointCall;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        const orderedFields: { name: Name; value: ast.CodeBlock }[] = [];
        if (this.context.includePathParametersInWrappedRequest({ endpoint: this.endpoint, wrapper: this.wrapper })) {
            for (const pathParameter of [
                ...example.rootPathParameters,
                ...example.servicePathParameters,
                ...example.endpointPathParameters
            ]) {
                orderedFields.push({
                    name: pathParameter.name,
                    value: this.exampleGenerator.getSnippetForTypeReference({
                        exampleTypeReference: pathParameter.value,
                        parseDatetimes
                    })
                });
            }
        }
        for (const exampleQueryParameter of example.queryParameters) {
            const isSingleQueryParameter =
                exampleQueryParameter.shape == null || exampleQueryParameter.shape.type === "single";
            const singleValueSnippet = this.exampleGenerator.getSnippetForTypeReference({
                exampleTypeReference: exampleQueryParameter.value,
                parseDatetimes
            });
            const value = isSingleQueryParameter
                ? singleValueSnippet
                : this.csharp.codeblock((writer: Writer) =>
                      writer.writeNode(
                          this.csharp.list({
                              entries: [singleValueSnippet]
                          })
                      )
                  );
            orderedFields.push({
                name: exampleQueryParameter.name.name,
                value
            });
        }

        for (const header of [...example.endpointHeaders, ...example.serviceHeaders]) {
            orderedFields.push({
                name: header.name.name,
                value: this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: header.value,
                    parseDatetimes
                })
            });
        }

        example.request?._visit({
            reference: (reference) => {
                orderedFields.push({
                    name: this.wrapper.bodyKey,
                    value: this.exampleGenerator.getSnippetForTypeReference({
                        exampleTypeReference: reference,
                        parseDatetimes
                    })
                });
            },
            inlinedRequestBody: (inlinedRequestBody) => {
                for (const property of inlinedRequestBody.properties) {
                    orderedFields.push({
                        name: property.name.name,
                        value: this.exampleGenerator.getSnippetForTypeReference({
                            exampleTypeReference: property.value,
                            parseDatetimes
                        })
                    });
                }
            },
            _other: () => undefined
        });
        const args = orderedFields.map(({ name, value }) => {
            return {
                name: name.pascalCase.safeName,
                assignment: value
            };
        });
        const instantiateClass = this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args,
            multiline: true
        });
        return this.csharp.codeblock((writer: Writer) => writer.writeNode(instantiateClass));
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.sourceFiles,
            this.getDirectory(),
            RelativeFilePath.of(`${this.classReference.name}.cs`)
        );
    }

    private getDirectory(): RelativeFilePath {
        const directory = this.context.getDirectoryForServiceId(this.serviceId);
        return RelativeFilePath.of(directory ? `${directory}/Requests` : "Requests");
    }
}
