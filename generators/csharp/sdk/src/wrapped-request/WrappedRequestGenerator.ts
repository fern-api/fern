import { CSharpFile, FileGenerator } from "@fern-api/csharp-base"
import { csharp } from "@fern-api/csharp-codegen"
import { ExampleGenerator, generateField, generateFieldForFileProperty } from "@fern-api/fern-csharp-model"
import { RelativeFilePath, join } from "@fern-api/fs-utils"

import {
    ContainerType,
    ExampleEndpointCall,
    HttpEndpoint,
    Name,
    SdkRequestWrapper,
    ServiceId,
    TypeReference
} from "@fern-fern/ir-sdk/api"

import { SdkCustomConfigSchema } from "../SdkCustomConfig"
import { SdkGeneratorContext } from "../SdkGeneratorContext"

export declare namespace WrappedRequestGenerator {
    export interface Args {
        serviceId: ServiceId
        wrapper: SdkRequestWrapper
        context: SdkGeneratorContext
        endpoint: HttpEndpoint
    }
}

export class WrappedRequestGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: csharp.ClassReference
    private wrapper: SdkRequestWrapper
    private serviceId: ServiceId
    private endpoint: HttpEndpoint
    private exampleGenerator: ExampleGenerator

    public constructor({ wrapper, context, serviceId, endpoint }: WrappedRequestGenerator.Args) {
        super(context)
        this.wrapper = wrapper
        this.serviceId = serviceId
        this.classReference = this.context.getRequestWrapperReference(this.serviceId, this.wrapper.wrapperName)
        this.endpoint = endpoint
        this.exampleGenerator = new ExampleGenerator(context)
    }

    protected doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.Record,
            annotations: [this.context.getSerializableAttribute()]
        })

        const service = this.context.getHttpServiceOrThrow(this.serviceId)
        const isProtoRequest = this.context.endpointUsesGrpcTransport(service, this.endpoint)
        const protobufProperties: { propertyName: string; typeReference: TypeReference }[] = []

        if (this.context.includePathParametersInWrappedRequest({ endpoint: this.endpoint, wrapper: this.wrapper })) {
            for (const pathParameter of this.endpoint.allPathParameters) {
                class_.addField(
                    csharp.field({
                        name: pathParameter.name.pascalCase.safeName,
                        type: this.context.csharpTypeMapper.convert({ reference: pathParameter.valueType }),
                        access: csharp.Access.Public,
                        get: true,
                        set: true,
                        summary: pathParameter.docs,
                        useRequired: true,
                        initializer: this.context.getLiteralInitializerFromTypeReference({
                            typeReference: pathParameter.valueType
                        }),
                        annotations: [this.context.getJsonIgnoreAnnotation()]
                    })
                )
            }
        }

        for (const query of this.endpoint.queryParameters) {
            const propertyName = query.name.name.pascalCase.safeName
            const type = query.allowMultiple
                ? csharp.Type.list(
                      this.context.csharpTypeMapper.convert({ reference: query.valueType, unboxOptionals: true })
                  )
                : this.context.csharpTypeMapper.convert({ reference: query.valueType })
            class_.addField(
                csharp.field({
                    name: propertyName,
                    type,
                    access: csharp.Access.Public,
                    get: true,
                    set: true,
                    summary: query.docs,
                    useRequired: true,
                    initializer: this.context.getLiteralInitializerFromTypeReference({
                        typeReference: query.valueType
                    }),
                    annotations: [this.context.getJsonIgnoreAnnotation()]
                })
            )
            if (isProtoRequest) {
                protobufProperties.push({
                    propertyName,
                    typeReference: query.allowMultiple
                        ? TypeReference.container(ContainerType.list(query.valueType))
                        : query.valueType
                })
            }
        }
        for (const header of [...service.headers, ...this.endpoint.headers]) {
            class_.addField(
                csharp.field({
                    name: header.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
                    access: csharp.Access.Public,
                    get: true,
                    set: true,
                    summary: header.docs,
                    useRequired: true,
                    initializer: this.context.getLiteralInitializerFromTypeReference({
                        typeReference: header.valueType
                    }),
                    annotations: [this.context.getJsonIgnoreAnnotation()]
                })
            )
        }

        this.endpoint.requestBody?._visit({
            reference: (reference) => {
                const type = this.context.csharpTypeMapper.convert({ reference: reference.requestBodyType })
                const useRequired = !type.isOptional()
                class_.addField(
                    csharp.field({
                        name: this.wrapper.bodyKey.pascalCase.safeName,
                        type,
                        access: csharp.Access.Public,
                        get: true,
                        set: true,
                        summary: reference.docs,
                        useRequired,
                        annotations: [this.context.getJsonIgnoreAnnotation()]
                    })
                )
            },
            inlinedRequestBody: (request) => {
                for (const property of [...request.properties, ...(request.extendedProperties ?? [])]) {
                    const field = generateField({
                        property,
                        className: this.classReference.name,
                        context: this.context
                    })
                    class_.addField(field)

                    if (isProtoRequest) {
                        protobufProperties.push({
                            propertyName: field.name,
                            typeReference: property.valueType
                        })
                    }
                }
            },
            fileUpload: (request) => {
                for (const property of request.properties) {
                    switch (property.type) {
                        case "bodyProperty":
                            class_.addField(
                                generateField({
                                    property,
                                    className: this.classReference.name,
                                    context: this.context,
                                    jsonProperty: false
                                })
                            )
                            break
                        case "file":
                            class_.addField(
                                generateFieldForFileProperty({
                                    property: property.value,
                                    className: this.classReference.name,
                                    context: this.context
                                })
                            )
                    }
                }
            },
            bytes: () => undefined,
            _other: () => undefined
        })

        class_.addMethod(this.context.getToStringMethod())

        if (isProtoRequest) {
            const protobufService = this.context.protobufResolver.getProtobufServiceForServiceId(this.serviceId)
            if (protobufService != null) {
                const protobufClassReference = csharp.classReference({
                    name: this.classReference.name,
                    namespace: this.context.protobufResolver.getNamespaceFromProtobufFileOrThrow(protobufService.file),
                    namespaceAlias: "Proto"
                })
                class_.addMethod(
                    this.context.csharpProtobufTypeMapper.toProtoMethod({
                        classReference: this.classReference,
                        protobufClassReference,
                        properties: protobufProperties
                    })
                )
            }
        }

        return new CSharpFile({
            clazz: class_,
            directory: this.getDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        })
    }

    public doGenerateSnippet({
        example,
        parseDatetimes
    }: {
        example: ExampleEndpointCall
        parseDatetimes: boolean
    }): csharp.CodeBlock {
        const orderedFields: { name: Name; value: csharp.CodeBlock }[] = []
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
                })
            }
        }
        for (const exampleQueryParameter of example.queryParameters) {
            const isSingleQueryParameter =
                exampleQueryParameter.shape == null || exampleQueryParameter.shape.type === "single"
            const singleValueSnippet = this.exampleGenerator.getSnippetForTypeReference({
                exampleTypeReference: exampleQueryParameter.value,
                parseDatetimes
            })
            const value = isSingleQueryParameter
                ? singleValueSnippet
                : csharp.codeblock((writer) =>
                      writer.writeNode(
                          csharp.list({
                              entries: [singleValueSnippet]
                          })
                      )
                  )
            orderedFields.push({
                name: exampleQueryParameter.name.name,
                value
            })
        }

        for (const header of [...example.endpointHeaders, ...example.serviceHeaders]) {
            orderedFields.push({
                name: header.name.name,
                value: this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: header.value,
                    parseDatetimes
                })
            })
        }

        example.request?._visit({
            reference: (reference) => {
                orderedFields.push({
                    name: this.wrapper.bodyKey,
                    value: this.exampleGenerator.getSnippetForTypeReference({
                        exampleTypeReference: reference,
                        parseDatetimes
                    })
                })
            },
            inlinedRequestBody: (inlinedRequestBody) => {
                for (const property of inlinedRequestBody.properties) {
                    orderedFields.push({
                        name: property.name.name,
                        value: this.exampleGenerator.getSnippetForTypeReference({
                            exampleTypeReference: property.value,
                            parseDatetimes
                        })
                    })
                }
            },
            _other: () => undefined
        })
        const args = orderedFields.map(({ name, value }) => {
            return {
                name: name.pascalCase.safeName,
                assignment: value
            }
        })
        const instantiateClass = csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        })
        return csharp.codeblock((writer) => writer.writeNode(instantiateClass))
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            this.getDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        )
    }

    private getDirectory(): RelativeFilePath {
        const directory = this.context.getDirectoryForServiceId(this.serviceId)
        return RelativeFilePath.of(directory ? `${directory}/Requests` : "Requests")
    }
}
