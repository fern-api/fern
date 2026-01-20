import { fail } from "node:assert";
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
import { DefaultValueExtractor, ExtractedDefault } from "../DefaultValueExtractor";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

/**
 * Information about a property with a default value
 */
interface PropertyWithDefault {
    /** The property name in the generated C# code */
    propertyName: string;
    /** The extracted default value information */
    defaultValue: ExtractedDefault;
}

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
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: false,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record,
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

        const propertiesWithDefaults: PropertyWithDefault[] = [];

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

            let type = query.allowMultiple
                ? this.Collection.list(
                      this.context.csharpTypeMapper.convert({
                          reference: query.valueType,
                          unboxOptionals: true
                      })
                  )
                : this.context.csharpTypeMapper.convert({ reference: query.valueType });

            // Strip 'required' from non-optional types with default values so users may omit them
            if (defaultValue != null && !type.isOptional) {
                type = type.asOptional();
            }

            const field = class_.addField({
                origin: query,
                type,
                access: ast.Access.Public,
                get: true,
                set: true,
                summary: query.docs,
                useRequired: defaultValue == null,
                initializer: this.context.getLiteralInitializerFromTypeReference({
                    typeReference: query.valueType
                }),
                annotations: [this.System.Text.Json.Serialization.JsonIgnore]
            });

            if (defaultValue != null) {
                propertiesWithDefaults.push({ propertyName: field.name, defaultValue });
            }

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

            let type = this.context.csharpTypeMapper.convert({ reference: header.valueType });

            if (defaultValue != null && !type.isOptional) {
                type = type.asOptional();
            }

            const field = class_.addField({
                origin: header,
                type,
                access: ast.Access.Public,
                get: true,
                set: true,
                summary: header.docs,
                useRequired: defaultValue == null,
                initializer: this.context.getLiteralInitializerFromTypeReference({
                    typeReference: header.valueType
                }),
                annotations: [this.System.Text.Json.Serialization.JsonIgnore]
            });

            if (defaultValue != null) {
                propertiesWithDefaults.push({ propertyName: field.name, defaultValue });
            }
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

                    let field: ast.Field;
                    if (defaultValue != null) {
                        // Generate field with optional type and no 'required' keyword
                        let type = this.context.csharpTypeMapper.convert({ reference: property.valueType });
                        if (!type.isOptional) {
                            type = type.asOptional();
                        }
                        field = class_.addField({
                            origin: property,
                            type,
                            access: ast.Access.Public,
                            get: true,
                            set: true,
                            summary: property.docs,
                            useRequired: false,
                            initializer: this.context.getLiteralInitializerFromTypeReference({
                                typeReference: property.valueType
                            }),
                            annotations: [this.context.createJsonPropertyNameAttribute(property.name.wireValue)]
                        });
                        propertiesWithDefaults.push({ propertyName: field.name, defaultValue });
                    } else {
                        // Use standard field generation
                        field = generateField(class_, {
                            property,
                            className: this.classReference.name,
                            context: this.context
                        });
                    }

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

        this.context.getToStringMethod(class_);

        // Generate Defaults class and WithDefaults() method if feature flag is enabled and there are properties with defaults
        if (this.generation.settings.useDefaultRequestParameterValues && propertiesWithDefaults.length > 0) {
            this.generateDefaultsClass(class_, propertiesWithDefaults);
            this.generateWithDefaultsMethod(class_, propertiesWithDefaults);
        }

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

    /**
     * Returns the extracted default value if the feature is enabled, otherwise undefined.
     */
    private getDefaultIfEnabled(typeReference: TypeReference, useDefaults: boolean): ExtractedDefault | undefined {
        if (!useDefaults) {
            return undefined;
        }
        return this.defaultValueExtractor.extractDefault(typeReference);
    }

    /**
     * Generates a private static nested class containing const/static readonly fields for default values.
     */
    private generateDefaultsClass(class_: ast.Class, propertiesWithDefaults: PropertyWithDefault[]): void {
        const defaultsClass = class_.addNestedClass({
            name: "Defaults",
            access: ast.Access.Private,
            static_: true,
            type: ast.Class.ClassType.Class
        });

        for (const { propertyName, defaultValue } of propertiesWithDefaults) {
            const fieldType = this.generation.Types.Arbitrary(defaultValue.csharpType);
            if (defaultValue.isConst) {
                // Use const for primitive types that support it
                defaultsClass.addField({
                    name: propertyName,
                    type: fieldType,
                    access: ast.Access.Public,
                    const_: true,
                    initializer: this.csharp.codeblock(defaultValue.value)
                });
            } else {
                // Use static readonly for types that don't support const (e.g., BigInteger)
                defaultsClass.addField({
                    name: propertyName,
                    type: fieldType,
                    access: ast.Access.Public,
                    static_: true,
                    readonly: true,
                    initializer: this.csharp.codeblock(defaultValue.value)
                });
            }
        }
    }

    /**
     * Generates a WithDefaults() method that returns a new instance with default values applied for unset properties.
     */
    private generateWithDefaultsMethod(class_: ast.Class, propertiesWithDefaults: PropertyWithDefault[]): void {
        const withDefaultsBody = this.csharp.codeblock((writer: Writer) => {
            writer.write("return this with");
            writer.newLine();
            writer.write("{");
            writer.newLine();
            writer.indent();
            for (let i = 0; i < propertiesWithDefaults.length; i++) {
                const { propertyName } = propertiesWithDefaults[i]!;
                writer.write(`${propertyName} = ${propertyName} ?? Defaults.${propertyName}`);
                if (i < propertiesWithDefaults.length - 1) {
                    writer.write(",");
                }
                writer.newLine();
            }
            writer.dedent();
            writer.write("};");
        });

        class_.addMethod({
            name: "WithDefaults",
            access: ast.Access.Public,
            return_: this.classReference,
            summary: "Returns a new instance with default values applied for unset properties.",
            body: withDefaultsBody
        });
    }
}
