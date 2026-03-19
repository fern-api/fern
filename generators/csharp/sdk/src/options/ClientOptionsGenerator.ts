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
    /** Whether the parameter has an environment variable fallback (needs mutable setter). */
    hasEnvironmentVariable?: boolean;
    /** Whether the parameter is optional in the original constructor. */
    isOptional?: boolean;
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

        const hasDefault = defaultEnvironment != null;
        // In unified mode, when there's no default environment, make BaseUrl/Environment
        // required instead of defaulting to "" or null.
        const unified = this.settings.unifiedClientOptions;
        const makeRequired = hasDefault || unified;

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    return (this.baseUrlField = classOrInterface.addField({
                        origin: classOrInterface.explicit("BaseUrl"),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        useRequired: makeRequired,
                        type: this.Primitive.string,
                        summary: this.baseOptionsGenerator.members.baseUrlSummary,
                        initializer: hasDefault
                            ? this.csharp.codeblock((writer) => {
                                  writer.writeNode(this.Types.Environments);
                                  writer.write(`.${defaultEnvironmentName}`);
                              })
                            : unified
                              ? undefined
                              : this.csharp.codeblock('""')
                    }));
                },
                multipleBaseUrls: () => {
                    return (this.environmentField = classOrInterface.addField({
                        origin: classOrInterface.explicit("Environment"),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        useRequired: makeRequired,
                        type: this.Types.Environments,
                        summary: "The Environment for the API.",
                        initializer: hasDefault
                            ? this.csharp.codeblock((writer) => {
                                  writer.writeNode(this.Types.Environments);
                                  writer.write(`.${defaultEnvironmentName}`);
                              })
                            : unified
                              ? undefined
                              : this.csharp.codeblock("null")
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
            useRequired: makeRequired,
            type: this.Primitive.string,
            summary: this.baseOptionsGenerator.members.baseUrlSummary,
            initializer: hasDefault
                ? this.csharp.codeblock((writer) => {
                      writer.writeNode(this.Types.Environments);
                      writer.write(`.${defaultEnvironmentName}`);
                  })
                : unified
                  ? undefined
                  : this.csharp.codeblock('""')
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
                    this.addUnifiedField(class_, field);
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
                const isOptional =
                    header.valueType.type === "container" && header.valueType.container.type === "optional";
                const field: UnifiedField = {
                    name,
                    type,
                    docs: header.docs,
                    isOptional
                };
                this.addUnifiedField(class_, field);
                this.unifiedFields.push(field);
            }
        }
    }

    private addUnifiedField(class_: ast.Class, field: UnifiedField): void {
        // Fields with env var fallbacks need `set` since the constructor mutates them
        // via `clientOptions.Property ??= GetFromEnvironmentOrThrow(...)`.
        // Required fields (no env var, not optional) use `init` + `required`.
        // Optional fields use `init` and are nullable.
        const needsMutableSetter = field.hasEnvironmentVariable === true;
        const isRequired = !field.isOptional && !field.hasEnvironmentVariable;
        class_.addField({
            origin: class_.explicit(field.name),
            access: ast.Access.Public,
            get: true,
            set: needsMutableSetter ? true : undefined,
            init: needsMutableSetter ? undefined : true,
            useRequired: isRequired,
            type: isRequired ? field.type : field.type.asOptional(),
            summary: field.docs
        });
    }

    private getFieldsFromAuthScheme(scheme: FernIr.AuthScheme): UnifiedField[] {
        const isOptional = this.context.ir.sdkConfig.isAuthMandatory;
        if (scheme.type === "bearer") {
            return [
                {
                    name: scheme.token.pascalCase.safeName,
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${scheme.token.camelCase.safeName} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.tokenEnvVar != null
                }
            ];
        } else if (scheme.type === "basic") {
            return [
                {
                    name: scheme.username.pascalCase.safeName,
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${scheme.username.camelCase.safeName} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.usernameEnvVar != null
                },
                {
                    name: scheme.password.pascalCase.safeName,
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${scheme.password.camelCase.safeName} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.passwordEnvVar != null
                }
            ];
        } else if (scheme.type === "header") {
            return [
                {
                    name: scheme.name.name.pascalCase.safeName,
                    type: this.context.csharpTypeMapper.convert({ reference: scheme.valueType }),
                    docs: scheme.docs ?? `The ${scheme.name.name.camelCase.safeName} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.headerEnvVar != null
                }
            ];
        } else if (scheme.type === "oauth") {
            const fields: UnifiedField[] = [
                {
                    name: "ClientId",
                    type: this.Primitive.string,
                    docs: "The clientId to use for authentication.",
                    isOptional,
                    hasEnvironmentVariable: scheme.configuration.clientIdEnvVar != null
                },
                {
                    name: "ClientSecret",
                    type: this.Primitive.string,
                    docs: "The clientSecret to use for authentication.",
                    isOptional,
                    hasEnvironmentVariable: scheme.configuration.clientSecretEnvVar != null
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
                    docs: `The ${customProperty.property.name.name.camelCase.safeName} for OAuth authentication.`,
                    isOptional
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
                    docs: credential.docs ?? `The ${credential.camelName} for authentication.`,
                    isOptional: isOptional || credential.isOptional
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

        const hasRequiredUnifiedFields = this.unifiedFields.some((f) => !f.isOptional && !f.hasEnvironmentVariable);
        const hasRequiredBaseUrl = this.hasRequiredBaseUrlWithoutDefault();
        const needsCopyConstructor = hasRequiredUnifiedFields || hasRequiredBaseUrl;

        if (needsCopyConstructor) {
            // When ClientOptions has `required` fields, we need a copy constructor
            // annotated with [SetsRequiredMembers] so Clone() can create a new instance.
            // We also re-add the public parameterless constructor since defining any
            // explicit constructor suppresses C#'s implicit default constructor.
            this.addPublicParameterlessConstructor(cls);
            this.addCopyConstructor(cls);
        }

        const cloneBody = needsCopyConstructor
            ? this.csharp.codeblock((writer) => {
                  writer.writeLine("return new ClientOptions(this);");
              })
            : this.csharp.codeblock((writer) => {
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
              });

        cls.addMethod({
            access: ast.Access.Internal,
            summary: "Clones this and returns a new instance",
            name: "Clone",
            return_: this.Types.ClientOptions,
            body: cloneBody,
            isAsync: false,
            parameters: []
        });
    }

    private addPublicParameterlessConstructor(cls: ast.Class): void {
        // Explicitly add the public parameterless constructor since defining the
        // copy constructor suppresses the implicit default constructor in C#.
        cls.addConstructor({
            access: ast.Access.Public
        });
    }

    private addCopyConstructor(cls: ast.Class): void {
        const setsRequiredMembersRef = this.csharp.classReference({
            name: "SetsRequiredMembersAttribute",
            namespace: "System.Diagnostics.CodeAnalysis"
        });

        cls.addConstructor({
            access: ast.Access.Internal,
            annotations: [this.csharp.annotation({ reference: setsRequiredMembersRef })],
            parameters: [
                this.csharp.parameter({
                    name: "other",
                    type: this.Types.ClientOptions
                })
            ],
            body: this.csharp.codeblock((writer) => {
                if (this.baseUrlField) {
                    writer.writeLine(`${this.baseUrlField.name} = other.${this.baseUrlField.name};`);
                }
                if (this.environmentField) {
                    writer.writeLine(`${this.environmentField.name} = other.${this.environmentField.name};`);
                }
                writer.writeLine("HttpClient = other.HttpClient;");
                writer.writeLine("MaxRetries = other.MaxRetries;");
                writer.writeLine("Timeout = other.Timeout;");
                writer.writeStatement(
                    "Headers = new ",
                    this.Types.Headers,
                    "(new Dictionary<string, ",
                    this.Types.HeaderValue,
                    ">(other.Headers))"
                );
                writer.writeLine("AdditionalHeaders = other.AdditionalHeaders;");
                for (const field of this.unifiedFields) {
                    writer.writeLine(`${field.name} = other.${field.name};`);
                }
                if (this.settings.includeExceptionHandler) {
                    writer.writeLine("ExceptionHandler = other.ExceptionHandler.Clone();");
                }
            })
        });
    }

    /**
     * Returns true when unified-client-options is enabled and the BaseUrl/Environment
     * field has no default (i.e., it becomes `required`).
     */
    private hasRequiredBaseUrlWithoutDefault(): boolean {
        if (!this.settings.unifiedClientOptions) {
            return false;
        }
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        return defaultEnvironmentId == null;
    }
}
