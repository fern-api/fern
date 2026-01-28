import { fail } from "node:assert";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { ExampleGenerator, generateField, generateFieldForFileProperty } from "@fern-api/fern-csharp-model";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    ContainerType,
    ExampleEndpointCall,
    ExampleInlinedRequestBodyExtraProperty,
    HttpEndpoint,
    Name,
    SdkRequestWrapper,
    ServiceId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { DefaultValueExtractor, ExtractedDefault } from "../DefaultValueExtractor";
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
export class WrappedRequestGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private wrapper: SdkRequestWrapper;
    private serviceId: ServiceId;
    private endpoint: HttpEndpoint;
    private exampleGenerator: ExampleGenerator;
    private defaultValueExtractor: DefaultValueExtractor;

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedRequestGenerator.Args) {
        super(context);
        this.wrapper = wrapper;
        this.serviceId = serviceId;
        this.classReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName);

        this.endpoint = endpoint;
        this.exampleGenerator = new ExampleGenerator(context);
        this.defaultValueExtractor = new DefaultValueExtractor(context);
    }

    protected doGenerate(): CSharpFile {
        const hasExtraProperties =
            this.endpoint.requestBody?.type === "inlinedRequestBody" && this.endpoint.requestBody.extraProperties;

        const interfaces = [];
        if (hasExtraProperties) {
            interfaces.push(this.System.Text.Json.Serialization.IJsonOnDeserialized);
            interfaces.push(this.System.Text.Json.Serialization.IJsonOnSerializing);
        }

        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: false,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record,
            interfaceReferences: interfaces,
            annotations: [this.System.Serializable]
        });

        const service = this.context.getHttpService(this.serviceId);
        const isProtoRequest = this.context.endpointUsesGrpcTransport(
            service ?? fail(`Service with id ${this.serviceId} not found`),
            this.endpoint
        );
        const protobufProperties: {
            propertyName: string;
            typeReference: TypeReference;
        }[] = [];

        if (
            this.context.includePathParametersInWrappedRequest({
                endpoint: this.endpoint,
                wrapper: this.wrapper
            })
        ) {
            for (const pathParameter of this.endpoint.allPathParameters) {
                class_.addField({
                    origin: pathParameter,
                    type: this.context.csharpTypeMapper.convert({
                        reference: pathParameter.valueType
                    }),
                    access: ast.Access.Public,
                    get: true,
                    set: true,
                    summary: pathParameter.docs,
                    useRequired: true,
                    initializer: this.context.getLiteralInitializerFromTypeReference({
                        typeReference: pathParameter.valueType
                    }),
                    annotations: [this.System.Text.Json.Serialization.JsonIgnore]
                });
            }
        }

        const useDefaults = this.generation.settings.useDefaultRequestParameterValues;
        for (const query of this.endpoint.queryParameters) {
            const defaultValue = !query.allowMultiple
                ? this.getDefaultIfEnabled(query.valueType, useDefaults)
                : undefined;

            const type = query.allowMultiple
                ? this.Collection.list(
                      this.context.csharpTypeMapper.convert({
                          reference: query.valueType,
                          unboxOptionals: true
                      })
                  )
                : this.context.csharpTypeMapper.convert({ reference: query.valueType });

            const field = class_.addField({
                origin: query,
                type, // Keep original type, don't make optional for defaults
                access: ast.Access.Public,
                get: true,
                set: true,
                summary: query.docs,
                useRequired: defaultValue == null, // Remove required when there's a default
                initializer:
                    defaultValue != null
                        ? this.csharp.codeblock(defaultValue.value) // Use direct default assignment
                        : this.context.getLiteralInitializerFromTypeReference({
                              typeReference: query.valueType
                          }),
                annotations: [this.System.Text.Json.Serialization.JsonIgnore]
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

        for (const header of [...(service?.headers ?? []), ...this.endpoint.headers]) {
            const defaultValue = this.getDefaultIfEnabled(header.valueType, useDefaults);

            const type = this.context.csharpTypeMapper.convert({ reference: header.valueType });

            const field = class_.addField({
                origin: header,
                type, // Keep original type, don't make optional for defaults
                access: ast.Access.Public,
                get: true,
                set: true,
                summary: header.docs,
                useRequired: defaultValue == null, // Remove required when there's a default
                initializer:
                    defaultValue != null
                        ? this.csharp.codeblock(defaultValue.value) // Use direct default assignment
                        : this.context.getLiteralInitializerFromTypeReference({
                              typeReference: header.valueType
                          }),
                annotations: [this.System.Text.Json.Serialization.JsonIgnore]
            });
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                const type = this.context.csharpTypeMapper.convert({
                    reference: reference.requestBodyType
                });
                const useRequired = !type.isOptional;
                class_.addField({
                    origin: this.wrapper.bodyKey,
                    type,
                    access: ast.Access.Public,
                    get: true,
                    set: true,
                    summary: reference.docs,
                    useRequired,
                    annotations: [this.System.Text.Json.Serialization.JsonIgnore]
                });
            },
            inlinedRequestBody: (request) => {
                for (const property of [...request.properties, ...(request.extendedProperties ?? [])]) {
                    const defaultValue = this.getDefaultIfEnabled(property.valueType, useDefaults);

                    const field = generateField(class_, {
                        property,
                        className: this.classReference.name,
                        context: this.context,
                        initializerOverride:
                            defaultValue != null ? this.csharp.codeblock(defaultValue.value) : undefined,
                        useRequiredOverride: defaultValue != null ? false : undefined
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

        if (hasExtraProperties) {
            this.addExtensionDataField(class_);
            const additionalProperties = this.addAdditionalPropertiesProperty(class_);
            this.addOnDeserialized(class_, additionalProperties);
            this.addOnSerializing(class_, additionalProperties);
        }

        this.context.getToStringMethod(class_);

        if (isProtoRequest) {
            const protobufService = this.context.protobufResolver.getProtobufServiceForServiceId(this.serviceId);
            if (protobufService != null) {
                const protobufClassReference = this.csharp.classReference({
                    name: this.classReference.name,
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFile(protobufService.file),
                    namespaceAlias: "Proto"
                });
                this.context.csharpProtobufTypeMapper.toProtoMethod(class_, {
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
            namespace: this.generation.namespaces.root,
            generation: this.generation
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
        let extraPropertiesFromExample: ExampleInlinedRequestBodyExtraProperty[] | undefined;
        if (
            this.context.includePathParametersInWrappedRequest({
                endpoint: this.endpoint,
                wrapper: this.wrapper
            })
        ) {
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

                if (inlinedRequestBody.extraProperties != null && inlinedRequestBody.extraProperties.length > 0) {
                    extraPropertiesFromExample = inlinedRequestBody.extraProperties;
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

        if (extraPropertiesFromExample != null && extraPropertiesFromExample.length > 0) {
            const extraPropertiesSnippet = this.generateExtraPropertiesSnippet({
                extraProperties: extraPropertiesFromExample,
                parseDatetimes
            });
            args.push({
                name: "AdditionalProperties",
                assignment: extraPropertiesSnippet
            });
        }
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

    /**
     * Returns the extracted default value if the feature is enabled, otherwise undefined.
     */
    private getDefaultIfEnabled(typeReference: TypeReference, useDefaults: boolean): ExtractedDefault | undefined {
        if (!useDefaults) {
            return undefined;
        }
        return this.defaultValueExtractor.extractDefault(typeReference);
    }

    private addExtensionDataField(class_: ast.Class): void {
        class_.addField({
            origin: class_.explicit("_extensionData"),
            annotations: [this.System.Text.Json.Serialization.JsonExtensionData],
            access: ast.Access.Private,
            readonly: true,
            type: this.Collection.idictionary(this.Primitive.string, this.Primitive.object.asOptional(), {
                dontSimplify: true
            }),
            initializer: this.System.Collections.Generic.Dictionary(
                this.Primitive.string,
                this.Primitive.object.asOptional()
            ).new()
        });
    }

    private addAdditionalPropertiesProperty(class_: ast.Class): ast.Field {
        return class_.addField({
            origin: class_.explicit("AdditionalProperties"),
            annotations: [this.System.Text.Json.Serialization.JsonIgnore],
            access: ast.Access.Public,
            type: this.Types.AdditionalProperties(),
            get: true,
            set: true,
            initializer: this.csharp.codeblock("new()")
        });
    }

    private addOnSerializing(class_: ast.Class, additionalProperties: ast.Field): void {
        class_.addMethod({
            name: "OnSerializing",
            interfaceReference: this.System.Text.Json.Serialization.IJsonOnSerializing,
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock(`${additionalProperties.name}.CopyToExtensionData(_extensionData)`)
        });
    }

    private addOnDeserialized(class_: ast.Class, additionalProperties: ast.Field): void {
        class_.addMethod({
            name: "OnDeserialized",
            interfaceReference: this.System.Text.Json.Serialization.IJsonOnDeserialized,
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock(`${additionalProperties.name}.CopyFromExtensionData(_extensionData)`)
        });
    }

    private generateExtraPropertiesSnippet({
        extraProperties,
        parseDatetimes
    }: {
        extraProperties: ExampleInlinedRequestBodyExtraProperty[];
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer: Writer) => {
            writer.writeLine("new AdditionalProperties");
            writer.pushScope();
            for (const extraProperty of extraProperties) {
                const valueSnippet = this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: extraProperty.value,
                    parseDatetimes
                });
                writer.write(`["${extraProperty.name.wireValue}"] = `);
                writer.writeNode(valueSnippet);
                writer.writeLine(",");
            }
            writer.popScope();
        });
    }
}
