import { NameInput } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";

import {
    getInferredAuthCredentialParams,
    getInferredAuthScheme,
    getOAuthClientCredentialsScheme,
    getRequestPropertyFieldName,
    getRequestPropertyValueType,
    isGrantTypeRequestProperty,
    isPlainBooleanType,
    isPlainStringType,
    isRequestPropertyPointer,
    isTypeReferenceLiteral,
    isTypeReferencePointer,
    resolveTokenEndpointBodyProperties
} from "../authUtils.js";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * RequestOptions field names that a server URL variable must not shadow. Kept in
 * sync with the reserved names in the Go v1 generator (sdk.go). A variable whose
 * idiomatic name collides with one of these is exposed under a "ServerURL"-prefixed
 * name instead.
 */
const RESERVED_OPTION_NAMES = new Set<string>([
    "BaseURL",
    "Environment",
    "HTTPClient",
    "HTTPHeader",
    "BodyProperties",
    "QueryParameters",
    "MaxAttempts",
    "MaxBufSize",
    "MaxStreamReconnectAttempts",
    "DisableStreamReconnection",
    "DisableRetries"
]);

interface ServerVariableOption {
    variable: FernIr.ServerVariable;
    /** Exported RequestOptions field name, e.g. "Region" or "ServerURLEnvironment". */
    fieldName: string;
    /** Local variable name used during interpolation, e.g. "region". */
    localName: string;
}

interface BaseUrlTemplate {
    /** The Environment struct field the interpolated URL is assigned to (e.g. "Base"). */
    fieldName: string;
    /** The URL template containing {id} placeholders. */
    template: string;
}

interface TemplatedEnvironment {
    /** Pascal-cased environment name, matching the Environments struct field (e.g. "Production"). */
    name: string;
    /** Whether this environment is the API's default environment. */
    isDefault: boolean;
    /** URL templates whose {id} placeholders reference the collected variables. */
    templates: BaseUrlTemplate[];
}

interface ServerVariableConfig {
    /** Server URL variables, de-duplicated by id. */
    variables: FernIr.ServerVariable[];
    /** Every environment that declares URL template(s), with its template(s). */
    environments: TemplatedEnvironment[];
}

function dedupeServerVariablesById(variables: FernIr.ServerVariable[]): FernIr.ServerVariable[] {
    const seen = new Set<string>();
    const result: FernIr.ServerVariable[] = [];
    for (const variable of variables) {
        if (!seen.has(variable.id)) {
            seen.add(variable.id);
            result.push(variable);
        }
    }
    return result;
}

export declare namespace ClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        isRootClient?: boolean;
        fernFilepath: FernIr.FernFilepath;
        subpackage: FernIr.Subpackage | undefined;
        nestedSubpackages: FernIr.SubpackageId[];
        serviceId: FernIr.ServiceId | undefined;
        service: FernIr.HttpService | undefined;
    }
}

export class ClientGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private isRootClient: boolean = false;
    private fernFilepath: FernIr.FernFilepath;
    private nestedSubpackages: FernIr.SubpackageId[] = [];
    private subpackage: FernIr.Subpackage | undefined;
    private serviceId: FernIr.ServiceId | undefined;
    private service: FernIr.HttpService | undefined;

    constructor({
        fernFilepath,
        isRootClient = false,
        subpackage,
        nestedSubpackages,
        context,
        serviceId,
        service
    }: ClientGenerator.Args) {
        super(context);
        this.isRootClient = isRootClient;
        this.fernFilepath = fernFilepath;
        this.subpackage = subpackage;
        this.nestedSubpackages = nestedSubpackages;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): GoFile {
        const struct = go.struct({
            ...this.context.getClientClassReference({
                fernFilepath: this.fernFilepath,
                subpackage: this.subpackage
            })
        });

        struct.addConstructor(this.getConstructor());

        struct.addField(
            go.field({
                name: "options",
                type: this.context.getRequestOptionsType()
            })
        );

        if (this.serviceId != null && this.service != null) {
            for (const endpoint of this.service.endpoints) {
                const method = this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    subpackage: this.subpackage,
                    endpoint
                });
                if (method != null) {
                    struct.addMethod(method);
                }
            }
            if (this.service.endpoints.length > 0) {
                struct.addField(
                    go.field({
                        name: "WithRawResponse",
                        type: go.Type.pointer(
                            go.Type.reference(
                                this.context.getRawClientClassReference({
                                    fernFilepath: this.service.name.fernFilepath,
                                    subpackage: this.subpackage
                                })
                            )
                        )
                    })
                );
            }
        }

        for (const subpackageId of this.nestedSubpackages) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            if (!this.context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            struct.addField(
                go.field({
                    name: this.context.getClassName(subpackage.name),
                    type: go.Type.pointer(
                        go.Type.reference(
                            this.context.getClientClassReference({ fernFilepath: subpackage.fernFilepath, subpackage })
                        )
                    )
                })
            );
        }

        struct.addField(
            go.field({
                name: "baseURL",
                type: go.Type.string()
            }),
            this.context.caller.getField()
        );

        return new GoFile({
            node: struct,
            rootImportPath: this.context.getRootImportPath(),
            packageName: this.getPackageName(),
            importPath: this.getImportPath(),
            directory: this.getDirectory(),
            filename: this.context.getClientFilename(this.subpackage),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.context.getClientFilename(this.subpackage)));
    }

    private getConstructor(): go.Struct.Constructor {
        const fields: go.StructField[] = [];
        for (const subpackageId of this.nestedSubpackages) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            if (!this.context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            fields.push({
                name: this.context.getClassName(subpackage.name),
                value: this.instantiateSubClient({ subpackage })
            });
        }
        if (this.service != null && this.service.endpoints.length > 0) {
            fields.push({
                name: "WithRawResponse",
                value: this.instantiateRawClient()
            });
        }
        fields.push(
            {
                name: "options",
                value: go.TypeInstantiation.reference(go.codeblock("options"))
            },
            {
                name: "baseURL",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: go.codeblock("options"),
                        selector: go.codeblock("BaseURL")
                    })
                )
            },
            {
                name: "caller",
                value: go.TypeInstantiation.reference(
                    this.context.caller.instantiate({
                        client: go.TypeInstantiation.reference(
                            go.selector({
                                on: go.codeblock("options"),
                                selector: go.codeblock("HTTPClient")
                            })
                        ),
                        maxAttempts: go.TypeInstantiation.reference(
                            go.selector({
                                on: go.codeblock("options"),
                                selector: go.codeblock("MaxAttempts")
                            })
                        ),
                        disableRetries: go.TypeInstantiation.reference(
                            go.selector({
                                on: go.codeblock("options"),
                                selector: go.codeblock("DisableRetries")
                            })
                        )
                    })
                )
            }
        );
        return {
            name: this.context.getClientConstructorName(this.subpackage),
            parameters: [
                this.isRootClient
                    ? this.context.getVariadicRequestOptionParameter()
                    : this.context.getRequestOptionsParameter()
            ],
            body: go.codeblock((writer) => {
                if (this.isRootClient) {
                    writer.write("options := ");
                    writer.writeNode(this.context.callNewRequestOptions(go.codeblock("opts...")));
                    writer.newLine();
                }
                this.writeEnvironmentVariables({ writer });
                writer.write("return ");
                writer.writeNode(
                    go.TypeInstantiation.structPointer({
                        typeReference: this.context.getClientClassReference({
                            fernFilepath: this.fernFilepath,
                            subpackage: this.subpackage
                        }),
                        fields
                    })
                );
            })
        };
    }

    private writeEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        this.writeAuthEnvironmentVariables({ writer });
        this.writeHeaderEnvironmentVariables({ writer });
        if (this.isRootClient) {
            this.writeServerVariableInterpolation({ writer });
            this.writeOAuthTokenFetching({ writer });
            this.writeInferredAuthTokenFetching({ writer });
        }
    }

    /**
     * Returns the server URL variables together with the URL template(s) declared by
     * EVERY templated environment. The variables are read from the first environment
     * that declares both variables and template(s), which guarantees the template's
     * {id} placeholders line up with the collected variable ids; the option naming
     * mirrors the Go v1 generator so the generated field references line up. For
     * singleBaseUrl each environment carries a single template with an empty fieldName
     * (the result is assigned to options.BaseURL rather than an Environment struct
     * field). For multipleBaseUrls a base URL missing a template falls back to that
     * environment's literal URL.
     */
    private getServerVariableConfig(): ServerVariableConfig {
        const empty: ServerVariableConfig = { variables: [], environments: [] };
        // Gated behind the `serverUrlVariables` config option (default true). When
        // disabled, no server-URL-variable options nor the construction-time base-URL
        // template interpolation are emitted, matching the Go v1 generator's suppression
        // and falling back to the pre-feature base-URL behavior.
        if (this.context.customConfig.serverUrlVariables === false) {
            return empty;
        }
        const config = this.context.ir.environments;
        if (config == null) {
            return empty;
        }
        const environments = config.environments;
        switch (environments.type) {
            case "singleBaseUrl": {
                let variables: FernIr.ServerVariable[] = [];
                for (const environment of environments.environments) {
                    if (
                        environment.urlVariables != null &&
                        environment.urlVariables.length > 0 &&
                        environment.urlTemplate != null
                    ) {
                        variables = dedupeServerVariablesById(environment.urlVariables);
                        break;
                    }
                }
                if (variables.length === 0) {
                    return empty;
                }
                const templatedEnvironments: TemplatedEnvironment[] = [];
                for (const environment of environments.environments) {
                    if (environment.urlTemplate == null) {
                        continue;
                    }
                    templatedEnvironments.push({
                        name: this.context.caseConverter.pascalUnsafe(environment.name),
                        isDefault: environment.id === config.defaultEnvironment,
                        templates: [{ fieldName: "", template: environment.urlTemplate }]
                    });
                }
                return { variables, environments: templatedEnvironments };
            }
            case "multipleBaseUrls": {
                const baseUrlNamesById = new Map<string, string>();
                for (const baseUrl of environments.baseUrls) {
                    baseUrlNamesById.set(baseUrl.id, this.context.caseConverter.pascalUnsafe(baseUrl.name));
                }
                let variables: FernIr.ServerVariable[] = [];
                for (const environment of environments.environments) {
                    if (
                        environment.urlVariables != null &&
                        Object.keys(environment.urlVariables).length > 0 &&
                        environment.urlTemplates != null &&
                        Object.keys(environment.urlTemplates).length > 0
                    ) {
                        const collected: FernIr.ServerVariable[] = [];
                        for (const baseUrlId of Object.keys(environment.urlVariables).sort()) {
                            collected.push(...(environment.urlVariables[baseUrlId] ?? []));
                        }
                        variables = dedupeServerVariablesById(collected);
                        break;
                    }
                }
                if (variables.length === 0) {
                    return empty;
                }
                const templatedEnvironments: TemplatedEnvironment[] = [];
                for (const environment of environments.environments) {
                    if (environment.urlTemplates == null || Object.keys(environment.urlTemplates).length === 0) {
                        continue;
                    }
                    const templates: BaseUrlTemplate[] = [];
                    const baseUrlIds = new Set<string>([
                        ...Object.keys(environment.urlTemplates),
                        ...Object.keys(environment.urls)
                    ]);
                    for (const baseUrlId of [...baseUrlIds].sort()) {
                        const template = environment.urlTemplates[baseUrlId] ?? environment.urls[baseUrlId];
                        if (template == null) {
                            continue;
                        }
                        templates.push({
                            fieldName: baseUrlNamesById.get(baseUrlId) ?? baseUrlId,
                            template
                        });
                    }
                    templatedEnvironments.push({
                        name: this.context.caseConverter.pascalUnsafe(environment.name),
                        isDefault: environment.id === config.defaultEnvironment,
                        templates
                    });
                }
                return { variables, environments: templatedEnvironments };
            }
            default:
                assertNever(environments);
        }
    }

    private toServerVariableOptions(variables: FernIr.ServerVariable[]): ServerVariableOption[] {
        return variables.map((variable) => {
            const pascal = this.context.caseConverter.pascalUnsafe(variable.name);
            const collides = RESERVED_OPTION_NAMES.has(pascal);
            const fieldName = collides ? `ServerURL${pascal}` : pascal;
            const localName = collides ? `serverURL${pascal}` : this.context.caseConverter.camelSafe(variable.name);
            return { variable, fieldName, localName };
        });
    }

    /**
     * Writes the construction-time interpolation block: when any server URL variable
     * option is set, rebuild the base URL(s) from the SELECTED environment's URL
     * template(s), substituting each {id} placeholder with the provided value (falling
     * back to the variable's default). The selected environment is recognized by
     * matching options.BaseURL (singleBaseUrl) or options.Environment
     * (multipleBaseUrls) against the generated environment constants; when no
     * environment is selected, the default (or first) templated environment's
     * template(s) are used. A custom base URL or environment value is left untouched.
     */
    private writeServerVariableInterpolation({ writer }: { writer: go.Writer }): void {
        const { variables, environments: templatedEnvironments } = this.getServerVariableConfig();
        if (variables.length === 0 || templatedEnvironments.length === 0) {
            return;
        }
        const options = this.toServerVariableOptions(variables);
        const optionsByVariableId = new Map<string, ServerVariableOption>();
        for (const option of options) {
            optionsByVariableId.set(option.variable.id, option);
        }
        const isMultipleBaseUrls = this.context.isMultipleBaseUrlsEnvironment();
        const fallbackEnvironment =
            templatedEnvironments.find((environment) => environment.isDefault) ?? templatedEnvironments[0];

        const variableConditions = options.map((option) => `options.${option.fieldName} != ""`).join(" || ");
        writer.write("if ");
        if (isMultipleBaseUrls) {
            // Only rebuild the environment URLs from the template(s) when the user has NOT
            // supplied an explicit base URL. An explicit BaseURL always takes precedence and
            // must not be clobbered by server-variable interpolation.
            writer.write(`options.BaseURL == "" && (${variableConditions})`);
        } else {
            writer.write(variableConditions);
        }
        writer.writeLine(" {");
        writer.indent();

        // Declare a local for each variable, defaulting to its IR default when unset.
        for (const option of options) {
            writer.writeLine(`${option.localName} := options.${option.fieldName}`);
            if (option.variable.default != null) {
                writer.writeLine(`if ${option.localName} == "" {`);
                writer.indent();
                writer.writeLine(`${option.localName} = ${JSON.stringify(option.variable.default)}`);
                writer.dedent();
                writer.writeLine("}");
            }
        }

        const writeEnvironmentsReference = (environmentName: string): void => {
            writer.writeNode(
                go.typeReference({
                    name: "Environments",
                    importPath: this.context.getRootImportPath()
                })
            );
            writer.write(`.${environmentName}`);
        };

        if (isMultipleBaseUrls) {
            // Match the selected environment against the generated environment constants and
            // rebuild every host from that environment's template(s). A nil environment
            // falls back to the default (or first) templated environment; a custom
            // environment value is left untouched.
            writer.writeLine("switch options.Environment {");
            for (const environment of templatedEnvironments) {
                writer.write("case ");
                if (environment === fallbackEnvironment) {
                    writer.write("nil, ");
                }
                writeEnvironmentsReference(environment.name);
                writer.writeLine(":");
                writer.indent();
                writer.write("options.Environment = ");
                writer.writeNode(
                    go.typeReference({
                        name: "Environment",
                        importPath: this.context.getRootImportPath()
                    })
                );
                writer.writeLine("{");
                writer.indent();
                for (const { fieldName, template } of environment.templates) {
                    writer.write(`${fieldName}: `);
                    this.writeSprintfForTemplate({ writer, template, optionsByVariableId });
                    writer.writeLine(",");
                }
                writer.dedent();
                writer.writeLine("}");
                writer.dedent();
            }
            writer.writeLine("}");
        } else {
            // Match the selected base URL against the generated environment constants and
            // rebuild it from that environment's template. An empty base URL falls back to
            // the default (or first) templated environment; a custom base URL is left
            // untouched.
            writer.writeLine("switch options.BaseURL {");
            for (const environment of templatedEnvironments) {
                const template = environment.templates[0];
                if (template == null) {
                    continue;
                }
                writer.write("case ");
                if (environment === fallbackEnvironment) {
                    writer.write(`"", `);
                }
                writeEnvironmentsReference(environment.name);
                writer.writeLine(":");
                writer.indent();
                writer.write("options.BaseURL = ");
                this.writeSprintfForTemplate({ writer, template: template.template, optionsByVariableId });
                writer.newLine();
                writer.dedent();
            }
            writer.writeLine("}");
        }

        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * Writes a fmt.Sprintf call that reconstructs a URL from its template, replacing
     * each {id} placeholder with the corresponding local variable (in order).
     */
    private writeSprintfForTemplate({
        writer,
        template,
        optionsByVariableId
    }: {
        writer: go.Writer;
        template: string;
        optionsByVariableId: Map<string, ServerVariableOption>;
    }): void {
        const args: string[] = [];
        // Escape any literal percent signs (e.g. percent-encoded URL segments) before
        // introducing %s verbs, so they aren't misinterpreted by fmt.Sprintf.
        const escaped = template.replace(/%/g, "%%");
        const format = escaped.replace(/\{([^}]+)\}/g, (match, id: string) => {
            const option = optionsByVariableId.get(id);
            if (option == null) {
                return match;
            }
            args.push(option.localName);
            return "%s";
        });
        if (args.length === 0) {
            writer.write(JSON.stringify(template));
            return;
        }
        writer.writeNode(
            go.invokeFunc({
                func: go.typeReference({ name: "Sprintf", importPath: "fmt" }),
                arguments_: [go.codeblock(JSON.stringify(format)), ...args.map((arg) => go.codeblock(arg))]
            })
        );
    }

    private writeHeaderEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        for (const header of this.context.ir.headers) {
            if (header.env != null) {
                if (isTypeReferencePointer(header.valueType, this.context.ir.types)) {
                    this.writeOptionalEnvConditional({
                        writer,
                        propertyReference: this.getOptionsPropertyReference(header.name),
                        env: header.env
                    });
                } else {
                    this.writeEnvConditional({
                        writer,
                        propertyReference: this.getOptionsPropertyReference(header.name),
                        env: header.env
                    });
                }
            }
            // After env fallback, apply clientDefault if present
            if (header.clientDefault != null) {
                if (isTypeReferencePointer(header.valueType, this.context.ir.types)) {
                    this.writeOptionalClientDefaultConditional({
                        writer,
                        propertyReference: this.getOptionsPropertyReference(header.name),
                        clientDefault: header.clientDefault,
                        localVariableName: `${this.context.getParameterName(header.name)}Default`
                    });
                } else if (isPlainStringType(header.valueType) || isPlainBooleanType(header.valueType)) {
                    this.writeClientDefaultConditional({
                        writer,
                        propertyReference: this.getOptionsPropertyReference(header.name),
                        clientDefault: header.clientDefault
                    });
                }
            }
        }
    }

    private writeAuthEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        if (this.context.ir.auth == null) {
            return;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "basic":
                    this.writeBasicAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "bearer":
                    this.writeBearerAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "header":
                    this.writeHeaderAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "oauth":
                    this.writeOAuthEnvironmentVariables({ writer, scheme });
                    break;
                case "inferred":
                    this.writeInferredAuthEnvironmentVariables({ writer });
                    break;
            }
        }
    }

    private writeBasicAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.BasicAuthScheme;
    }): void {
        const usernameOmitted = !!scheme.usernameOmit;
        const passwordOmitted = !!scheme.passwordOmit;
        if (scheme.usernameEnvVar != null && !usernameOmitted) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.username),
                env: scheme.usernameEnvVar
            });
        }
        if (scheme.passwordEnvVar != null && !passwordOmitted) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.password),
                env: scheme.passwordEnvVar
            });
        }
    }

    private writeBearerAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.BearerAuthScheme;
    }): void {
        if (scheme.tokenEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.token),
                env: scheme.tokenEnvVar
            });
        }
    }

    private writeHeaderAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.HeaderAuthScheme;
    }): void {
        if (scheme.headerEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.name),
                env: scheme.headerEnvVar
            });
        }
    }

    private writeOAuthEnvironmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: FernIr.OAuthScheme;
    }): void {
        const configuration = scheme.configuration;
        if (configuration == null || configuration.type !== "clientCredentials") {
            return;
        }
        if (configuration.clientIdEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: go.selector({ on: go.codeblock("options"), selector: go.codeblock("ClientID") }),
                env: configuration.clientIdEnvVar
            });
        }
        if (configuration.clientSecretEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: go.selector({ on: go.codeblock("options"), selector: go.codeblock("ClientSecret") }),
                env: configuration.clientSecretEnvVar
            });
        }
    }

    private writeOAuthTokenFetching({ writer }: { writer: go.Writer }): void {
        const oauthScheme = getOAuthClientCredentialsScheme(this.context.ir);
        if (oauthScheme == null || oauthScheme.configuration?.type !== "clientCredentials") {
            return;
        }
        const oauthConfiguration = oauthScheme.configuration;

        const authServiceFernFilepath = this.getAuthServiceFernFilepath();
        if (authServiceFernFilepath == null) {
            return;
        }

        // Get the token endpoint from the IR
        const tokenEndpoint = this.getOAuthTokenEndpoint();
        if (tokenEndpoint == null) {
            return;
        }

        // If inferred auth is also configured, only generate the shared authOptions/authClient
        // setup here. The inferred auth block will handle SetTokenGetter, matching the Java
        // behavior where inferred auth takes precedence in the default construction path.
        const hasInferredAuth = getInferredAuthScheme(this.context.ir) != null;
        if (hasInferredAuth) {
            writer.writeNode(
                go.codeblock((w) => {
                    // Clone options for the auth client to avoid infinite recursion
                    w.writeLine("authOptions := *options");

                    // Create the auth client (shared between OAuth and inferred auth)
                    const authClientImportPath = this.context.getClientFileLocation({
                        fernFilepath: authServiceFernFilepath,
                        subpackage: undefined
                    }).importPath;
                    w.write("authClient := ");
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "NewClient",
                                importPath: authClientImportPath
                            }),
                            arguments_: [go.codeblock("&authOptions")]
                        })
                    );
                    w.newLine();
                })
            );
            return;
        }

        // Get the method name from the endpoint
        const methodName = this.context.getMethodName(tokenEndpoint.name);

        // Get the request field names from the IR
        const requestProperties = oauthConfiguration.tokenEndpoint.requestProperties;
        const clientIdFieldName = getRequestPropertyFieldName(this.context, requestProperties.clientId);
        const clientSecretFieldName = getRequestPropertyFieldName(this.context, requestProperties.clientSecret);

        // Create the token provider for OAuth (defaultExpirySeconds=0 means tokens without expiry never auto-refresh)
        writer.writeNode(
            go.codeblock((w) => {
                w.write("oauthTokenProvider := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewTokenProvider",
                            importPath: this.context.getCoreImportPath()
                        }),
                        arguments_: [go.codeblock("0")]
                    })
                );
                w.newLine();

                // Clone options for the auth client to avoid infinite recursion
                // This is done before SetTokenGetter so authOptions won't have the token getter
                w.writeLine("authOptions := *options");

                // Create the auth client
                const authClientImportPath = this.context.getClientFileLocation({
                    fernFilepath: authServiceFernFilepath,
                    subpackage: undefined
                }).importPath;
                w.write("authClient := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewClient",
                            importPath: authClientImportPath
                        }),
                        arguments_: [go.codeblock("&authOptions")]
                    })
                );
                w.newLine();

                // Set up the token getter function
                w.writeLine("options.SetTokenGetter(func() (string, error) {");
                w.indent();
                w.writeLine("return oauthTokenProvider.GetOrFetch(func() (string, int64, error) {");
                w.indent();

                // Fetch a new token from the auth endpoint
                // Get the request type reference from the endpoint
                const serviceId = oauthConfiguration.tokenEndpoint.endpointReference.serviceId;
                const requestTypeRef = this.getTokenEndpointRequestTypeReference(serviceId, tokenEndpoint);
                w.write(`response, err := authClient.${methodName}(`);
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Background",
                            importPath: "context"
                        }),
                        arguments_: []
                    })
                );
                w.write(", &");
                w.writeNode(requestTypeRef);
                w.writeLine("{");
                w.indent();
                const clientIdIsPointer = isRequestPropertyPointer(requestProperties.clientId, this.context.ir.types);
                const clientSecretIsPointer = isRequestPropertyPointer(
                    requestProperties.clientSecret,
                    this.context.ir.types
                );

                w.write(`${clientIdFieldName}: `);
                if (clientIdIsPointer) {
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "String",
                                importPath: this.context.getRootImportPath()
                            }),
                            arguments_: [go.codeblock("options.ClientID")]
                        })
                    );
                } else {
                    w.write("options.ClientID");
                }
                w.writeLine(",");
                w.write(`${clientSecretFieldName}: `);
                if (clientSecretIsPointer) {
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "String",
                                importPath: this.context.getRootImportPath()
                            }),
                            arguments_: [go.codeblock("options.ClientSecret")]
                        })
                    );
                } else {
                    w.write("options.ClientSecret");
                }
                w.writeLine(",");
                // A non-literal grant_type property is always sent with the
                // "client_credentials" value: the client credentials flow requires
                // grant_type=client_credentials (RFC 6749 §4.4.2), and nothing else
                // supplies it when the spec models it as a plain string.
                for (const customProperty of requestProperties.customProperties ?? []) {
                    if (!isGrantTypeRequestProperty(customProperty)) {
                        continue;
                    }
                    const valueType = getRequestPropertyValueType(customProperty);
                    if (valueType != null && isTypeReferenceLiteral(valueType, this.context.ir.types)) {
                        continue;
                    }
                    const grantTypeFieldName = getRequestPropertyFieldName(this.context, customProperty);
                    w.write(`${grantTypeFieldName}: `);
                    if (isRequestPropertyPointer(customProperty, this.context.ir.types)) {
                        w.writeNode(
                            go.invokeFunc({
                                func: go.typeReference({
                                    name: "String",
                                    importPath: this.context.getRootImportPath()
                                }),
                                arguments_: [go.codeblock('"client_credentials"')]
                            })
                        );
                    } else {
                        w.write('"client_credentials"');
                    }
                    w.writeLine(",");
                }
                w.dedent();
                w.writeLine("})");
                w.writeLine("if err != nil {");
                w.indent();
                w.writeLine('return "", 0, err');
                w.dedent();
                w.writeLine("}");
                const responseProperties = oauthConfiguration.tokenEndpoint.responseProperties;
                const accessTokenField = this.context.getFieldName(responseProperties.accessToken.property.name);
                this.writeTokenResponse({
                    writer: w,
                    accessTokenField,
                    accessTokenIsPointer: this.isResponsePropertyPointer(responseProperties.accessToken),
                    expiryProperty: responseProperties.expiresIn,
                    missingAccessTokenError: "oauth response missing access token"
                });
                w.dedent();
                w.writeLine("})");
                w.dedent();
                w.writeLine("})");
            })
        );
    }

    private getOAuthTokenEndpoint(): FernIr.HttpEndpoint | undefined {
        const oauthScheme = getOAuthClientCredentialsScheme(this.context.ir);
        if (oauthScheme?.configuration?.type !== "clientCredentials") {
            return undefined;
        }
        const { endpointId, serviceId } = oauthScheme.configuration.tokenEndpoint.endpointReference;
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            return undefined;
        }
        return service.endpoints.find((ep) => ep.id === endpointId);
    }

    private isResponsePropertyPointer(responseProperty: FernIr.ResponseProperty): boolean {
        return isTypeReferencePointer(responseProperty.property.valueType, this.context.ir.types);
    }

    private writeTokenResponse({
        writer,
        accessTokenField,
        accessTokenIsPointer,
        expiryProperty,
        missingAccessTokenError
    }: {
        writer: go.Writer;
        accessTokenField: string;
        accessTokenIsPointer: boolean;
        expiryProperty: FernIr.ResponseProperty | undefined;
        missingAccessTokenError: string;
    }): void {
        if (accessTokenIsPointer) {
            writer.writeLine(`if response.${accessTokenField} == nil || *response.${accessTokenField} == "" {`);
        } else {
            writer.writeLine(`if response.${accessTokenField} == "" {`);
        }
        writer.indent();
        writer.write('return "", 0, ');
        writer.writeNode(
            go.invokeFunc({
                func: go.typeReference({
                    name: "New",
                    importPath: "errors"
                }),
                arguments_: [go.codeblock(JSON.stringify(missingAccessTokenError))]
            })
        );
        writer.newLine();
        writer.dedent();
        writer.writeLine("}");

        const accessTokenValue = accessTokenIsPointer
            ? `*response.${accessTokenField}`
            : `response.${accessTokenField}`;
        if (expiryProperty == null) {
            writer.writeLine(`return ${accessTokenValue}, int64(core.DefaultExpirySeconds), nil`);
            return;
        }

        const expiryField = this.context.getFieldName(expiryProperty.property.name);
        const expiryIsPointer = this.isResponsePropertyPointer(expiryProperty);
        const expiryValue = expiryIsPointer ? `*response.${expiryField}` : `response.${expiryField}`;
        writer.writeLine("expiresIn := int64(core.DefaultExpirySeconds)");
        if (expiryIsPointer) {
            writer.writeLine(`if response.${expiryField} != nil {`);
        } else {
            writer.writeLine(`if response.${expiryField} > 0 {`);
        }
        writer.indent();
        writer.writeLine(`expiresIn = int64(${expiryValue})`);
        writer.dedent();
        writer.writeLine("}");
        writer.writeLine(`return ${accessTokenValue}, expiresIn, nil`);
    }

    private getAuthServiceFernFilepath(): FernIr.FernFilepath | undefined {
        const oauthScheme = getOAuthClientCredentialsScheme(this.context.ir);
        if (oauthScheme?.configuration?.type === "clientCredentials") {
            const serviceId = oauthScheme.configuration.tokenEndpoint.endpointReference.serviceId;
            const service = this.context.ir.services[serviceId];
            if (service != null) {
                return service.name.fernFilepath;
            }
        }
        return undefined;
    }

    private writeInferredAuthEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return;
        }
        const credentialParams = this.getInferredAuthCredentialParameters();
        for (const param of credentialParams) {
            if (param.envVar != null) {
                this.writeEnvConditional({
                    writer,
                    propertyReference: go.selector({
                        on: go.codeblock("options"),
                        selector: go.codeblock(param.fieldName)
                    }),
                    env: param.envVar
                });
            }
        }
    }

    private writeInferredAuthTokenFetching({ writer }: { writer: go.Writer }): void {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return;
        }

        const authServiceFernFilepath = this.getInferredAuthServiceFernFilepath();
        if (authServiceFernFilepath == null) {
            return;
        }

        const tokenEndpoint = this.getInferredAuthTokenEndpoint();
        if (tokenEndpoint == null) {
            return;
        }

        const methodName = this.context.getMethodName(tokenEndpoint.name);
        const credentialParams = this.getInferredAuthCredentialParameters();

        // When OAuth is also configured, authOptions/authClient are already declared
        // by writeOAuthTokenFetching. We only need the inferred auth provider and SetTokenGetter.
        const hasOAuth = getOAuthClientCredentialsScheme(this.context.ir) != null;

        writer.writeNode(
            go.codeblock((w) => {
                // Create the token provider for inferred auth (DefaultExpirySeconds applies a 1hr default when expiry is missing)
                w.write("inferredAuthProvider := ");
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "NewTokenProvider",
                            importPath: this.context.getCoreImportPath()
                        }),
                        arguments_: [go.codeblock("core.DefaultExpirySeconds")]
                    })
                );
                w.newLine();

                // Only declare authOptions/authClient if OAuth hasn't already done so
                if (!hasOAuth) {
                    // Clone options for the auth client to avoid infinite recursion
                    w.writeLine("authOptions := *options");

                    // Create the auth client
                    const authClientImportPath = this.context.getClientFileLocation({
                        fernFilepath: authServiceFernFilepath,
                        subpackage: undefined
                    }).importPath;
                    w.write("authClient := ");
                    w.writeNode(
                        go.invokeFunc({
                            func: go.typeReference({
                                name: "NewClient",
                                importPath: authClientImportPath
                            }),
                            arguments_: [go.codeblock("&authOptions")]
                        })
                    );
                    w.newLine();
                }

                // Set up the token getter function
                w.writeLine("options.SetTokenGetter(func() (string, error) {");
                w.indent();
                w.writeLine("return inferredAuthProvider.GetOrFetch(func() (string, int64, error) {");
                w.indent();

                // Build the request struct for the token endpoint call
                const serviceId = inferredScheme.tokenEndpoint.endpoint.serviceId;
                const requestTypeRef = this.getTokenEndpointRequestTypeReference(serviceId, tokenEndpoint);

                w.write(`response, err := authClient.${methodName}(`);
                w.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Background",
                            importPath: "context"
                        }),
                        arguments_: []
                    })
                );
                w.write(", &");
                w.writeNode(requestTypeRef);
                w.writeLine("{");
                w.indent();

                // Set credential parameters from options
                for (const param of credentialParams) {
                    if (param.isPointer) {
                        w.write(`${param.fieldName}: `);
                        w.writeNode(
                            go.invokeFunc({
                                func: go.typeReference({
                                    name: "String",
                                    importPath: this.context.getRootImportPath()
                                }),
                                arguments_: [go.codeblock(`options.${param.fieldName}`)]
                            })
                        );
                        w.writeLine(",");
                    } else {
                        w.writeLine(`${param.fieldName}: options.${param.fieldName},`);
                    }
                }

                w.dedent();
                w.writeLine("})");
                w.writeLine("if err != nil {");
                w.indent();
                w.writeLine('return "", 0, err');
                w.dedent();
                w.writeLine("}");

                // Extract access token from response using authenticatedRequestHeaders
                // The first authenticated request header's response property gives us the access token field
                const authHeaders = inferredScheme.tokenEndpoint.authenticatedRequestHeaders;
                let accessTokenField = "AccessToken";
                const firstAuthHeader = authHeaders[0];
                if (firstAuthHeader != null && firstAuthHeader.responseProperty != null) {
                    accessTokenField = this.context.getFieldName(firstAuthHeader.responseProperty.property.name);
                }

                const accessTokenIsPointer =
                    firstAuthHeader?.responseProperty != null &&
                    this.isResponsePropertyPointer(firstAuthHeader.responseProperty);
                this.writeTokenResponse({
                    writer: w,
                    accessTokenField,
                    accessTokenIsPointer,
                    expiryProperty: inferredScheme.tokenEndpoint.expiryProperty,
                    missingAccessTokenError: "inferred auth response missing access token"
                });

                w.dedent();
                w.writeLine("})");
                w.dedent();
                w.writeLine("})");
            })
        );
    }

    private getInferredAuthTokenEndpoint(): FernIr.HttpEndpoint | undefined {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return undefined;
        }
        const { endpointId, serviceId } = inferredScheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[serviceId];
        if (service == null) {
            return undefined;
        }
        return service.endpoints.find((ep) => ep.id === endpointId);
    }

    private getInferredAuthServiceFernFilepath(): FernIr.FernFilepath | undefined {
        const inferredScheme = getInferredAuthScheme(this.context.ir);
        if (inferredScheme == null) {
            return undefined;
        }
        const serviceId = inferredScheme.tokenEndpoint.endpoint.serviceId;
        const service = this.context.ir.services[serviceId];
        if (service != null) {
            return service.name.fernFilepath;
        }
        return undefined;
    }

    private getInferredAuthCredentialParameters(): Array<{
        fieldName: string;
        isPointer: boolean;
        envVar: string | undefined;
    }> {
        const tokenEndpoint = this.getInferredAuthTokenEndpoint();
        if (tokenEndpoint == null) {
            return [];
        }

        // Get base credential params from shared utility
        const baseParams = getInferredAuthCredentialParams(tokenEndpoint, this.context.ir.types, this.context);

        // Enrich with envVar from endpoint headers
        const headerEnvVars = new Map<string, string>();
        for (const header of tokenEndpoint.headers) {
            if (header.env != null) {
                headerEnvVars.set(this.context.getFieldName(header.name), header.env);
            }
        }

        return baseParams.map((param) => ({
            ...param,
            envVar: headerEnvVars.get(param.fieldName)
        }));
    }

    /**
     * Resolves the request type reference for a token endpoint, handling both
     * wrapper requests and justRequestBody (named type reference) requests.
     */
    private getTokenEndpointRequestTypeReference(
        serviceId: FernIr.ServiceId,
        tokenEndpoint: FernIr.HttpEndpoint
    ): go.TypeReference {
        if (tokenEndpoint.sdkRequest?.shape.type === "wrapper") {
            return this.context.getRequestWrapperTypeReference(serviceId, tokenEndpoint.sdkRequest.shape.wrapperName);
        }
        if (
            tokenEndpoint.sdkRequest?.shape.type === "justRequestBody" &&
            tokenEndpoint.sdkRequest.shape.value.type === "typeReference" &&
            tokenEndpoint.sdkRequest.shape.value.requestBodyType.type === "named"
        ) {
            const namedType = tokenEndpoint.sdkRequest.shape.value.requestBodyType;
            return go.typeReference({
                name: this.context.getClassName(namedType.name),
                importPath: this.context.getPackageLocation(namedType.fernFilepath).importPath
            });
        }
        // Fallback: use requestParameterName if available
        if (tokenEndpoint.sdkRequest?.requestParameterName != null) {
            return this.context.getRequestWrapperTypeReference(
                serviceId,
                tokenEndpoint.sdkRequest.requestParameterName
            );
        }
        return go.typeReference({
            name: "GetTokenRequest",
            importPath: this.context.getRootImportPath()
        });
    }

    /**
     * Resolves body properties for a token endpoint, handling both inlined
     * request bodies and referenced type declarations.
     */
    private resolveTokenEndpointBodyProperties(
        tokenEndpoint: FernIr.HttpEndpoint
    ): Array<{ name: FernIr.NameAndWireValueOrString; valueType: FernIr.TypeReference }> {
        return resolveTokenEndpointBodyProperties(tokenEndpoint, this.context.ir.types);
    }

    private writeEnvConditional({
        writer,
        propertyReference,
        env
    }: {
        writer: go.Writer;
        propertyReference: go.Selector;
        env: string;
    }): void {
        writer.write("if ");
        writer.writeNode(propertyReference);
        writer.writeLine(' == "" {');
        writer.indent();
        writer.writeNode(propertyReference);
        writer.write(" = ");
        writer.writeNode(this.context.callGetenv(env));
        writer.newLine();
        writer.dedent();
        writer.writeLine("}");
    }

    private writeOptionalEnvConditional({
        writer,
        propertyReference,
        env
    }: {
        writer: go.Writer;
        propertyReference: go.Selector;
        env: string;
    }): void {
        writer.write("if ");
        writer.writeNode(propertyReference);
        writer.writeLine(" == nil {");
        writer.indent();
        writer.write("if value := ");
        writer.writeNode(this.context.callGetenv(env));
        writer.writeLine('; value != "" {');
        writer.indent();
        writer.writeNode(propertyReference);
        writer.writeLine(" = &value");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }

    private writeClientDefaultConditional({
        writer,
        propertyReference,
        clientDefault
    }: {
        writer: go.Writer;
        propertyReference: go.Selector;
        clientDefault: FernIr.Literal;
    }): void {
        const zeroValue = clientDefault.type === "boolean" ? "false" : '""';
        writer.write("if ");
        writer.writeNode(propertyReference);
        writer.writeLine(` == ${zeroValue} {`);
        writer.indent();
        writer.writeNode(propertyReference);
        writer.write(" = ");
        writer.writeNode(this.context.getLiteralValue(clientDefault));
        writer.newLine();
        writer.dedent();
        writer.writeLine("}");
    }

    private writeOptionalClientDefaultConditional({
        writer,
        propertyReference,
        clientDefault,
        localVariableName
    }: {
        writer: go.Writer;
        propertyReference: go.Selector;
        clientDefault: FernIr.Literal;
        localVariableName: string;
    }): void {
        writer.write("if ");
        writer.writeNode(propertyReference);
        writer.writeLine(" == nil {");
        writer.indent();
        writer.write(`${localVariableName} := `);
        writer.writeNode(this.context.getLiteralValue(clientDefault));
        writer.newLine();
        writer.writeNode(propertyReference);
        writer.writeLine(` = &${localVariableName}`);
        writer.dedent();
        writer.writeLine("}");
    }

    private getOptionsPropertyReference(name: NameInput): go.Selector {
        return go.selector({
            on: go.codeblock("options"),
            selector: go.codeblock(this.context.getFieldName(name))
        });
    }

    private instantiateSubClient({ subpackage }: { subpackage: FernIr.Subpackage }): go.TypeInstantiation {
        return go.TypeInstantiation.reference(
            go.invokeFunc({
                func: this.getClientConstructor({ subpackage }),
                arguments_: [go.codeblock("options")],
                multiline: false
            })
        );
    }

    private instantiateRawClient(): go.TypeInstantiation {
        return go.TypeInstantiation.reference(
            go.invokeFunc({
                func: go.typeReference({
                    name: this.context.getRawClientConstructorName(this.subpackage),
                    importPath: this.context.getClientFileLocation({
                        fernFilepath: this.fernFilepath,
                        subpackage: this.subpackage
                    }).importPath
                }),
                arguments_: [go.codeblock("options")],
                multiline: false
            })
        );
    }

    private getClientConstructor({ subpackage }: { subpackage: FernIr.Subpackage }): go.TypeReference {
        return go.typeReference({
            name: this.context.getClientConstructorName(subpackage),
            importPath: this.context.getClientFileLocation({ fernFilepath: subpackage.fernFilepath, subpackage })
                .importPath
        });
    }

    private getPackageName(): string {
        return this.context.getClientPackageName({ fernFilepath: this.fernFilepath, subpackage: this.subpackage });
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getClientFileLocation({ fernFilepath: this.fernFilepath, subpackage: this.subpackage })
            .directory;
    }

    private getImportPath(): string {
        return this.context.getClientFileLocation({ fernFilepath: this.fernFilepath, subpackage: this.subpackage })
            .importPath;
    }
}
