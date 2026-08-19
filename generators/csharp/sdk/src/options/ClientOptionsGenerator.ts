import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";
import { isEndpointSecurity } from "../endpoint/request/endpointAuthHeaders.js";
import { getClientCredentialsOrThrow } from "../oauth/getClientCredentials.js";
import { getServerVariableOptions } from "../root-client/serverVariables.js";
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
    private baseUrlExplicitlySetField: ast.Field | undefined;
    private environmentExplicitlySetField: ast.Field | undefined;
    private serverVariableFields: ast.Field[] = [];
    private unifiedFields: UnifiedField[] = [];
    /** The client options generated for literal-typed global headers (e.g. an API version header). */
    private literalHeaderFields: ast.Field[] = [];
    /** The opt-in `AppInfo` field, present only when `allow-user-agent-app-info` is enabled. */
    private appInfoField: ast.Field | undefined;

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
        const serverVariableOptions = getServerVariableOptions(
            this.context.ir.environments,
            this.case,
            this.settings.serverUrlVariables
        );
        this.createBaseUrlField(class_, serverVariableOptions.length > 0);
        this.addServerVariableFields(class_, serverVariableOptions);
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
        this.literalHeaderFields = this.baseOptionsGenerator.getLiteralHeaderOptions(class_, optionArgs);

        // The opt-in `allow-user-agent-app-info` client option. The sanitized
        // product token built from these fields is appended to the SDK's
        // `User-Agent` header by the root client. Only emitted when the flag is on so
        // default-off output is byte-identical.
        if (this.settings.allowUserAgentAppInfo) {
            this.appInfoField = class_.addField({
                origin: class_.explicit("AppInfo"),
                access: ast.Access.Public,
                get: true,
                init: true,
                type: this.Types.AppInfo.asOptional(),
                summary: "Application information appended to the `User-Agent` header as an RFC 9110 product token."
            });
        }

        if (isEndpointSecurity(this.context)) {
            this.addEndpointSecurityAuthRouting(class_);
        }

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

    /**
     * Exposes each server URL variable (e.g. region/edge) as an optional string property on
     * ClientOptions. The root client interpolates these into the environment URL(s) at
     * construction time; when omitted, the variable's IR default is used.
     */
    private addServerVariableFields(
        class_: ast.Class,
        serverVariableOptions: ReturnType<typeof getServerVariableOptions>
    ): void {
        for (const { variable, optionName } of serverVariableOptions) {
            const docs: string[] = [];
            if (variable.values != null && variable.values.length > 0) {
                docs.push(`The ${optionName} to route requests to. Allowed values: ${variable.values.join(", ")}.`);
            }
            if (variable.default != null) {
                docs.push(`Defaults to "${variable.default}".`);
            }
            this.serverVariableFields.push(
                class_.addField({
                    origin: class_.explicit(optionName),
                    access: ast.Access.Public,
                    get: true,
                    init: true,
                    type: this.Primitive.string.asOptional(),
                    summary: docs.length > 0 ? docs.join(" ") : undefined
                })
            );
        }
    }

    private createBaseUrlField(classOrInterface: ast.Class, hasServerVariables = false): ast.Field | undefined {
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        let defaultEnvironment: FernIr.NameOrString | undefined = undefined;
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
        const defaultEnvironmentName =
            defaultEnvironment != null
                ? this.settings.pascalCaseEnvironments
                    ? this.case.pascalSafe(defaultEnvironment)
                    : this.case.screamingSnakeSafe(defaultEnvironment)
                : undefined;

        const hasDefault = defaultEnvironment != null;
        // In unified mode, when there's no default environment, make BaseUrl/Environment
        // required instead of defaulting to "" or null.
        const unified = this.settings.unifiedClientOptions;
        const makeRequired = hasDefault || unified;

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    if (hasServerVariables) {
                        classOrInterface.addField({
                            name: "_baseUrl",
                            access: ast.Access.Private,
                            type: this.Primitive.string,
                            initializer: hasDefault
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.Types.Environments);
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock(unified ? "null!" : '""')
                        });
                        this.baseUrlExplicitlySetField = classOrInterface.addField({
                            origin: classOrInterface.explicit("IsBaseUrlExplicitlySet"),
                            access: ast.Access.Internal,
                            get: true,
                            set: ast.Access.Private,
                            type: this.Primitive.boolean,
                            initializer: this.csharp.codeblock("false")
                        });
                        classOrInterface.addMethod({
                            name: "SetBaseUrl",
                            access: ast.Access.Private,
                            parameters: [
                                this.csharp.parameter({
                                    name: "value",
                                    type: this.Primitive.string
                                })
                            ],
                            body: this.csharp.codeblock((writer) => {
                                writer.writeLine("_baseUrl = value;");
                                writer.writeLine("IsBaseUrlExplicitlySet = true;");
                            })
                        });
                    }
                    return (this.baseUrlField = classOrInterface.addField({
                        origin: classOrInterface.explicit("BaseUrl"),
                        access: ast.Access.Public,
                        get: true,
                        ...(hasServerVariables ? { set: true } : { init: true }),
                        useRequired: hasServerVariables ? unified && !hasDefault : makeRequired,
                        type: this.Primitive.string,
                        summary: this.baseOptionsGenerator.members.baseUrlSummary,
                        ...(hasServerVariables
                            ? {
                                  accessors: {
                                      get: (writer) => writer.write("_baseUrl"),
                                      set: (writer) => writer.write("SetBaseUrl(value)")
                                  }
                              }
                            : {
                                  initializer: hasDefault
                                      ? this.csharp.codeblock((writer) => {
                                            writer.writeNode(this.Types.Environments);
                                            writer.write(`.${defaultEnvironmentName}`);
                                        })
                                      : unified
                                        ? undefined
                                        : this.csharp.codeblock('""')
                              })
                    }));
                },
                multipleBaseUrls: () => {
                    if (hasServerVariables) {
                        classOrInterface.addField({
                            name: "_environment",
                            access: ast.Access.Private,
                            type: this.Types.Environments,
                            initializer: hasDefault
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.Types.Environments);
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock("null!")
                        });
                        this.environmentExplicitlySetField = classOrInterface.addField({
                            origin: classOrInterface.explicit("IsEnvironmentExplicitlySet"),
                            access: ast.Access.Internal,
                            get: true,
                            set: ast.Access.Private,
                            type: this.Primitive.boolean,
                            initializer: this.csharp.codeblock("false")
                        });
                        classOrInterface.addMethod({
                            name: "SetEnvironment",
                            access: ast.Access.Private,
                            parameters: [
                                this.csharp.parameter({
                                    name: "value",
                                    type: this.Types.Environments
                                })
                            ],
                            body: this.csharp.codeblock((writer) => {
                                writer.writeLine("_environment = value;");
                                writer.writeLine("IsEnvironmentExplicitlySet = true;");
                            })
                        });
                    }
                    return (this.environmentField = classOrInterface.addField({
                        origin: classOrInterface.explicit("Environment"),
                        access: ast.Access.Public,
                        get: true,
                        ...(hasServerVariables ? { set: true } : { init: true }),
                        useRequired: hasServerVariables ? unified && !hasDefault : makeRequired,
                        type: this.Types.Environments,
                        summary: "The Environment for the API.",
                        ...(hasServerVariables
                            ? {
                                  accessors: {
                                      get: (writer) => writer.write("_environment"),
                                      set: (writer) => writer.write("SetEnvironment(value)")
                                  }
                              }
                            : {
                                  initializer: hasDefault
                                      ? this.csharp.codeblock((writer) => {
                                            writer.writeNode(this.Types.Environments);
                                            writer.write(`.${defaultEnvironmentName}`);
                                        })
                                      : unified
                                        ? undefined
                                        : this.csharp.codeblock("null")
                              })
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
            const name = this.case.pascalSafe(header.name);
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
                    name: this.case.pascalSafe(scheme.token),
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${this.case.camelSafe(scheme.token)} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.tokenEnvVar != null
                }
            ];
        } else if (scheme.type === "basic") {
            return [
                {
                    name: this.case.pascalSafe(scheme.username),
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${this.case.camelSafe(scheme.username)} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.usernameEnvVar != null
                },
                {
                    name: this.case.pascalSafe(scheme.password),
                    type: this.Primitive.string,
                    docs: scheme.docs ?? `The ${this.case.camelSafe(scheme.password)} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.passwordEnvVar != null
                }
            ];
        } else if (scheme.type === "header") {
            return [
                {
                    name: this.case.pascalSafe(scheme.name),
                    type: this.context.csharpTypeMapper.convert({ reference: scheme.valueType }),
                    docs: scheme.docs ?? `The ${this.case.camelSafe(scheme.name)} to use for authentication.`,
                    isOptional,
                    hasEnvironmentVariable: scheme.headerEnvVar != null
                }
            ];
        } else if (scheme.type === "oauth") {
            const configuration = getClientCredentialsOrThrow(scheme);
            const fields: UnifiedField[] = [
                {
                    name: "ClientId",
                    type: this.Primitive.string,
                    docs: "The clientId to use for authentication.",
                    isOptional,
                    hasEnvironmentVariable: configuration.clientIdEnvVar != null
                },
                {
                    name: "ClientSecret",
                    type: this.Primitive.string,
                    docs: "The clientSecret to use for authentication.",
                    isOptional,
                    hasEnvironmentVariable: configuration.clientSecretEnvVar != null
                }
            ];
            for (const customProperty of configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
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
                    name: this.case.pascalSafe(customProperty.property.name),
                    type: typeRef,
                    docs: `The ${this.case.camelSafe(customProperty.property.name)} for OAuth authentication.`,
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

    /**
     * In endpoint-security mode, each endpoint applies only the auth scheme(s) it declares.
     * The root client stores each scheme's ready-to-send headers (keyed by the scheme's IR key)
     * in `AuthHeaderSchemes`, and `GetAuthHeadersForEndpoint` routes them per request: it picks
     * the first requirement whose schemes ALL have credentials available (OR across the list,
     * AND within a requirement), combines those schemes' headers, and throws naming the missing
     * schemes when none is satisfiable. Mirrors the TypeScript RoutingAuthProvider.
     */
    private addEndpointSecurityAuthRouting(class_: ast.Class): void {
        const headersType = this.Types.Headers;
        class_.addField({
            origin: class_.explicit("AuthHeaderSchemes"),
            access: ast.Access.Internal,
            get: true,
            set: true,
            type: this.Collection.map(this.Primitive.string, headersType),
            initializer: this.csharp.codeblock("new()"),
            summary:
                "Per-scheme auth headers, keyed by auth-scheme key, populated by the root client.\nUsed to route auth headers per endpoint based on each endpoint's declared security."
        });

        class_.addMethod({
            access: ast.Access.Internal,
            name: "GetAuthHeadersForEndpoint",
            return_: headersType,
            isAsync: false,
            parameters: [
                this.csharp.parameter({
                    name: "security",
                    type: this.Collection.array(this.Collection.array(this.Primitive.string))
                })
            ],
            summary: "Resolves the auth headers that apply to an endpoint with the given security requirements.",
            body: this.csharp.codeblock((writer) => {
                writer.write("var result = new ");
                writer.writeNode(headersType);
                writer.writeLine("();");
                writer.controlFlow("if", this.csharp.codeblock("security.Length == 0"));
                writer.writeLine("return result;");
                writer.endControlFlow();
                writer.controlFlow("foreach", this.csharp.codeblock("var requirement in security"));
                writer.controlFlow(
                    "if",
                    this.csharp.codeblock(
                        "Array.TrueForAll(requirement, schemeKey => AuthHeaderSchemes.ContainsKey(schemeKey))"
                    )
                );
                writer.controlFlow("foreach", this.csharp.codeblock("var schemeKey in requirement"));
                writer.controlFlow("foreach", this.csharp.codeblock("var header in AuthHeaderSchemes[schemeKey]"));
                writer.writeLine("result[header.Key] = header.Value;");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeLine("return result;");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeLine(
                    "var missing = string.Join(" +
                        '" OR ", ' +
                        "Array.ConvertAll(security, requirement => string.Join(" +
                        '" AND ", ' +
                        "Array.FindAll(requirement, schemeKey => !AuthHeaderSchemes.ContainsKey(schemeKey)))));"
                );
                writer.writeLine("throw new InvalidOperationException(");
                writer.writeLine(
                    '"No authentication credentials provided that satisfy the endpoint\'s security requirements. "'
                );
                writer.writeLine('+ "Please provide credentials for: " + missing');
                writer.writeLine(");");
            })
        });
    }

    private getCloneMethod(cls: ast.Class): void {
        // TODO: add the GRPC options here eventually
        // TODO: iterate over all public fields and generate the clone logic

        const hasRequiredUnifiedFields = this.unifiedFields.some((f) => !f.isOptional && !f.hasEnvironmentVariable);
        const hasRequiredBaseUrl = this.hasRequiredBaseUrlWithoutDefault();
        const needsCopyConstructor =
            hasRequiredUnifiedFields || hasRequiredBaseUrl || this.serverVariableFields.length > 0;

        if (needsCopyConstructor) {
            // A copy constructor preserves server-variable tracking state and supports
            // cloning required properties via [SetsRequiredMembers].
            this.addPublicParameterlessConstructor(cls);
            this.addCopyConstructor(cls, hasRequiredUnifiedFields || hasRequiredBaseUrl);
        }

        const cloneBody = needsCopyConstructor
            ? this.csharp.codeblock((writer) => {
                  writer.writeLine("return new ClientOptions(this);");
              })
            : this.csharp.codeblock((writer) => {
                  const unifiedFieldLines = this.unifiedFields
                      .map((field) => `\n    ${field.name} = ${field.name},`)
                      .join("");
                  const serverVariableFieldLines = this.serverVariableFields
                      .map((field) => `\n    ${field.name} = ${field.name},`)
                      .join("");
                  const literalHeaderFieldLines = this.literalHeaderFields
                      .map((field) => `\n    ${field.name} = ${field.name},`)
                      .join("");
                  writer.writeStatement(
                      `return new ClientOptions
{${this.baseUrlField ? `\n    ${this.baseUrlField.name} = ${this.baseUrlField.name},` : ""}${this.environmentField ? `\n    ${this.environmentField.name} = ${this.environmentField.name},` : ""}${serverVariableFieldLines}
    HttpClient = HttpClient,
    MaxRetries = MaxRetries,
    Timeout = Timeout,
    Headers = new `,
                      this.Types.Headers,
                      `(new Dictionary<string, `,
                      this.Types.HeaderValue,
                      `>(Headers)),
    AdditionalHeaders = AdditionalHeaders,${literalHeaderFieldLines}${unifiedFieldLines}${this.appInfoField ? `\n    ${this.appInfoField.name} = ${this.appInfoField.name},` : ""}
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

    private addCopyConstructor(cls: ast.Class, hasRequiredFields: boolean): void {
        const setsRequiredMembersRef = this.csharp.classReference({
            name: "SetsRequiredMembersAttribute",
            namespace: "System.Diagnostics.CodeAnalysis"
        });

        cls.addConstructor({
            access: ast.Access.Internal,
            annotations: hasRequiredFields ? [this.csharp.annotation({ reference: setsRequiredMembersRef })] : [],
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
                if (this.baseUrlExplicitlySetField) {
                    writer.writeLine(
                        `${this.baseUrlExplicitlySetField.name} = other.${this.baseUrlExplicitlySetField.name};`
                    );
                }
                if (this.environmentField) {
                    writer.writeLine(`${this.environmentField.name} = other.${this.environmentField.name};`);
                }
                if (this.environmentExplicitlySetField) {
                    writer.writeLine(
                        `${this.environmentExplicitlySetField.name} = other.${this.environmentExplicitlySetField.name};`
                    );
                }
                for (const field of this.serverVariableFields) {
                    writer.writeLine(`${field.name} = other.${field.name};`);
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
                for (const field of this.literalHeaderFields) {
                    writer.writeLine(`${field.name} = other.${field.name};`);
                }
                for (const field of this.unifiedFields) {
                    writer.writeLine(`${field.name} = other.${field.name};`);
                }
                if (this.appInfoField) {
                    writer.writeLine(`${this.appInfoField.name} = other.${this.appInfoField.name};`);
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
