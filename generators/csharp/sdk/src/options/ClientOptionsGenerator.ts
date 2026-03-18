import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils.js";
import { BaseOptionsGenerator, OptionArgs } from "./BaseOptionsGenerator.js";

interface UnifiedField {
    name: string;
    type: ast.Type;
    docs?: string;
}

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }
    private baseUrlField: ast.Field | undefined;
    private environmentField: ast.Field | undefined;
    private unifiedFields: UnifiedField[] = [];

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.ClientOptions,
            partial: true,
            access: ast.Access.Public,
            annotations: [this.System.Serializable]
        });
        const optionArgs: OptionArgs = {
            optional: false,
            includeInitializer: true
        };
        this.createBaseUrlField(class_);
        this.baseOptionsGenerator.getHttpClientField(class_, optionArgs);

        // Headers property is used for lazy auth header evaluation in root client
        this.baseOptionsGenerator.getHttpHeadersField(class_, {
            optional: false,
            includeInitializer: true,
            interfaceReference: undefined
        });

        this.baseOptionsGenerator.getAdditionalHeadersField(class_, {
            summary:
                "Additional headers to be sent with HTTP requests.\nHeaders with matching keys will be overwritten by headers set on the request.",
            includeInitializer: true
        });

        this.baseOptionsGenerator.getMaxRetriesField(class_, optionArgs);
        this.baseOptionsGenerator.getTimeoutField(class_, optionArgs);
        this.baseOptionsGenerator.getLiteralHeaderOptions(class_, optionArgs);

        if (this.settings.unifiedClientOptions) {
            this.addUnifiedAuthAndHeaderFields(class_);
        }

        if (this.context.hasGrpcEndpoints()) {
            this.getGrpcOptionsField(class_);
        }

        if (this.settings.includeExceptionHandler) {
            class_.addField({
                summary: "A handler that will handle exceptions thrown by the client.",
                access: ast.Access.Internal,
                origin: class_.explicit("ExceptionHandler"),
                type: this.Types.ExceptionHandler,
                get: true,
                set: true,
                initializer: this.csharp.codeblock((writer) => {
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: this.Types.ExceptionHandler,
                            arguments_: [this.csharp.codeblock("null")]
                        })
                    );
                })
            });
        }

        this.getCloneMethod(class_);

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.publicCore,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.Types.ClientOptions.name}.cs`));
    }

    private createBaseUrlField(classOrInterface: ast.Interface | ast.Class): ast.Field | undefined {
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        let defaultEnvironment: FernIr.Name | undefined = undefined;
        if (defaultEnvironmentId != null) {
            defaultEnvironment = this.context.ir.environments?.environments._visit({
                singleBaseUrl: (value) => {
                    return value.environments.find((env) => {
                        return env.id === defaultEnvironmentId;
                    })?.name;
                },
                multipleBaseUrls: (value) => {
                    return value.environments.find((env) => {
                        return env.id === defaultEnvironmentId;
                    })?.name;
                },
                _other: () => undefined
            });
        }
        const defaultEnvironmentName = this.settings.pascalCaseEnvironments
            ? defaultEnvironment?.pascalCase.safeName
            : defaultEnvironment?.screamingSnakeCase.safeName;

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    return (this.baseUrlField = classOrInterface.addField({
                        origin: classOrInterface.explicit("BaseUrl"),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: this.Primitive.string,
                        summary: this.baseOptionsGenerator.members.baseUrlSummary,
                        initializer:
                            defaultEnvironment != null
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.Types.Environments);
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                    }));
                },
                multipleBaseUrls: () => {
                    return (this.environmentField = classOrInterface.addField({
                        origin: classOrInterface.explicit("Environment"),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: this.Types.Environments,
                        summary: "The Environment for the API.",
                        initializer:
                            defaultEnvironment != null
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.Types.Environments);
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock("null") // TODO: remove this logic since it sets url to null
                    }));
                },
                _other: () => undefined
            });
            return field;
        }

        return (this.baseUrlField = classOrInterface.addField({
            origin: classOrInterface.explicit("BaseUrl"),
            access: ast.Access.Public,
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: this.Primitive.string,
            summary: this.baseOptionsGenerator.members.baseUrlSummary,
            initializer:
                defaultEnvironment != null
                    ? this.csharp.codeblock((writer) => {
                          writer.writeNode(this.Types.Environments);
                          writer.write(`.${defaultEnvironmentName}`);
                      })
                    : this.csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
        }));
    }

    private getGrpcOptionsField(classOrInterface: ast.Interface | ast.Class): void {
        classOrInterface.addField({
            origin: classOrInterface.explicit("GrpcOptions"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: this.Types.GrpcChannelOptions.asOptional(),
            summary: "The options used for gRPC client endpoints."
        });
    }

    private addUnifiedAuthAndHeaderFields(class_: ast.Class): void {
        const seenNames = new Set<string>();

        for (const scheme of this.context.ir.auth.schemes) {
            for (const field of this.getFieldsFromAuthScheme(scheme)) {
                if (!seenNames.has(field.name)) {
                    seenNames.add(field.name);
                    class_.addField({
                        origin: class_.explicit(field.name),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        type: field.type.asOptional(),
                        summary: field.docs
                    });
                    this.unifiedFields.push(field);
                }
            }
        }

        for (const header of this.context.ir.headers) {
            // Skip literal headers (already handled by getLiteralHeaderOptions)
            if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
                continue;
            }
            const name = header.name.name.pascalCase.safeName;
            if (!seenNames.has(name)) {
                seenNames.add(name);
                const type = this.context.csharpTypeMapper.convert({ reference: header.valueType });
                const field: UnifiedField = {
                    name,
                    type,
                    docs: header.docs
                };
                class_.addField({
                    origin: class_.explicit(name),
                    access: ast.Access.Public,
                    get: true,
                    init: true,
                    type: type.asOptional(),
                    summary: header.docs
                });
                this.unifiedFields.push(field);
            }
        }
    }

    private getFieldsFromAuthScheme(scheme: FernIr.AuthScheme): UnifiedField[] {
        if (scheme.type === "bearer") {
            return [
                {
                    name: scheme.token.pascalCase.safeName,
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${scheme.token.camelCase.safeName} to use for authentication.`
                }
            ];
        } else if (scheme.type === "basic") {
            return [
                {
                    name: scheme.username.pascalCase.safeName,
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${scheme.username.camelCase.safeName} to use for authentication.`
                },
                {
                    name: scheme.password.pascalCase.safeName,
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${scheme.password.camelCase.safeName} to use for authentication.`
                }
            ];
        } else if (scheme.type === "header") {
            return [
                {
                    name: scheme.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: scheme.valueType }),
                    docs: scheme.docs ?? `The ${scheme.name.name.camelCase.safeName} to use for authentication.`
                }
            ];
        } else if (scheme.type === "oauth") {
            const fields: UnifiedField[] = [
                {
                    name: "ClientId",
                    type: this.Primitive.string,
                    docs: "The clientId to use for authentication."
                },
                {
                    name: "ClientSecret",
                    type: this.Primitive.string,
                    docs: "The clientSecret to use for authentication."
                }
            ];
            for (const customProperty of scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
                if (
                    customProperty.property.valueType.type === "container" &&
                    customProperty.property.valueType.container.type === "literal"
                ) {
                    continue;
                }
                const typeRef = this.context.csharpTypeMapper.convert({
                    reference: customProperty.property.valueType
                });
                if (typeRef.isOptional) {
                    continue;
                }
                fields.push({
                    name: customProperty.property.name.name.pascalCase.safeName,
                    type: typeRef,
                    docs: `The ${customProperty.property.name.name.camelCase.safeName} for OAuth authentication.`
                });
            }
            return fields;
        } else if (scheme.type === "inferred") {
            // Inferred auth credentials become fields on ClientOptions
            const fields: UnifiedField[] = [];
            const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
            const tokenEndpointHttpService = this.context.getHttpService(tokenEndpointReference.serviceId);
            if (tokenEndpointHttpService == null) {
                return [];
            }
            const tokenEndpoint = this.context.resolveEndpoint(
                tokenEndpointHttpService,
                tokenEndpointReference.endpointId
            );
            const credentials = collectInferredAuthCredentials(this.context, tokenEndpoint);
            for (const credential of credentials) {
                const typeRef = this.context.csharpTypeMapper.convert({
                    reference: credential.typeReference
                });
                fields.push({
                    name: credential.pascalName,
                    type: typeRef,
                    docs: credential.docs ?? `The ${credential.camelName} for authentication.`
                });
            }
            return fields;
        } else {
            assertNever(scheme);
        }
    }

    private getCloneMethod(cls: ast.Class): void {
        // TODO: add the GRPC options here eventually
        // TODO: iterate over all public fields and generate the clone logic

        cls.addMethod({
            access: ast.Access.Internal,
            summary: "Clones this and returns a new instance",
            name: "Clone",
            return_: this.Types.ClientOptions,
            body: this.csharp.codeblock((writer) => {
                const unifiedFieldLines = this.unifiedFields
                    .map((field) => `\n    ${field.name} = ${field.name},`)
                    .join("");
                writer.writeStatement(
                    `return new ClientOptions
{${this.baseUrlField ? `\n    ${this.baseUrlField.name} = ${this.baseUrlField.name},` : ""}${this.environmentField ? `\n    ${this.environmentField.name} = ${this.environmentField.name},` : ""}
    HttpClient = HttpClient,
    MaxRetries = MaxRetries,
    Timeout = Timeout,
    Headers = new `,
                    this.Types.Headers,
                    `(new Dictionary<string, `,
                    this.Types.HeaderValue,
                    `>(Headers)),
    AdditionalHeaders = AdditionalHeaders,${unifiedFieldLines}
    ${this.settings.includeExceptionHandler ? "ExceptionHandler = ExceptionHandler.Clone()," : ""}
}`
                );
            }),
            isAsync: false,
            parameters: []
        });
    }
}
