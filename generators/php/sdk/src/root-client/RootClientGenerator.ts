import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { getRoutingSchemes } from "../auth/RoutingAuthProviderGenerator.js";
import { getClientCredentialsOrThrow } from "../oauth/getClientCredentials.js";
import { getOAuthTokenRequestProperties } from "../oauth/oauthTokenRequestProperties.js";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import {
    getMultipleBaseUrlsTemplatedEnvironment,
    getServerVariableOptions,
    getSingleBaseUrlTemplatedEnvironment,
    ServerVariableOption,
    urlTemplateToPhpConcatenation
} from "./serverVariables.js";

interface ConstructorParameters {
    all: ConstructorParameter[];
    required: ConstructorParameter[];
    optional: ConstructorParameter[];
    literal: LiteralParameter[];
}

interface ConstructorParameter {
    name: string;
    isOptional: boolean;
    typeReference: FernIr.TypeReference;
    docs?: string;
    header?: HeaderInfo;
    environmentVariable?: string;
    /**
     * Whether this parameter comes from a global API header (as opposed to an auth scheme).
     */
    isGlobalHeader?: boolean;
    clientDefault?: FernIr.Literal;
}

interface LiteralParameter {
    name: string;
    value: FernIr.Literal;
    docs?: string;
    header?: HeaderInfo;
    environmentVariable?: string;
}

interface HeaderInfo {
    name: string;
    prefix?: string;
}

const STRING_TYPE_REFERENCE = FernIr.TypeReference.primitive({
    v1: FernIr.PrimitiveTypeV1.String,
    v2: undefined
});

const BEARER_HEADER_INFO: HeaderInfo = {
    name: "Authorization",
    prefix: "Bearer"
};

const GET_FROM_ENV_OR_THROW = "getFromEnvOrThrow";
const GET_PLATFORM_USER_AGENT = "getPlatformUserAgent";
const APPEND_APP_INFO_TO_USER_AGENT = "appendAppInfoToUserAgent";

/**
 * Builds the self-contained `appendAppInfoToUserAgent` helper emitted into the
 * generated root client (only when `allowUserAgentAppInfo` is enabled). It is
 * standalone so that clients which do not opt in keep byte-identical generated
 * output, and never touches the shared always-shipped core-utilities.
 *
 * Sanitizes caller-supplied values: `name`/`version` are token-encoded (every
 * non-RFC-7230 `tchar` is percent-encoded, including spaces, control characters and
 * CR/LF) and `comment` has its delimiters (`(`, `)`, `\`) and control characters
 * (incl. CR/LF) escaped, so the untrusted values cannot inject additional header
 * content. Each value is trimmed before checking for blankness and before encoding,
 * so blank values are treated as absent rather than encoded into whitespace tokens.
 * Formats the appended product token as `{name}/{version} ({comment})`, dropping
 * `/version` and ` (comment)` when blank, and returns the User-Agent unchanged when
 * `appInfo`/`name` is absent.
 *
 * Exported so the emitted PHP can be exercised directly by unit tests.
 */
export function buildAppendAppInfoToUserAgentMethod(): php.Method {
    return php.method({
        access: "private",
        static_: true,
        name: APPEND_APP_INFO_TO_USER_AGENT,
        return_: php.Type.string(),
        parameters: [
            php.parameter({ name: "userAgent", type: php.Type.string() }),
            php.parameter({
                name: "appInfo",
                type: php.Type.optional(
                    php.Type.typeDict(
                        [
                            { key: "name", valueType: php.Type.string() },
                            { key: "version", valueType: php.Type.string(), optional: true },
                            { key: "comment", valueType: php.Type.string(), optional: true }
                        ],
                        { multiline: false }
                    )
                )
            })
        ],
        body: php.codeblock((writer) => {
            writer.controlFlow("if", php.codeblock("$appInfo === null"));
            writer.writeTextStatement("return $userAgent");
            writer.endControlFlow();
            writer.writeLine();

            // RFC 7230 token = 1*tchar. Any character outside that set is
            // percent-encoded so it cannot break out of the product token or inject
            // additional header content (spaces, control characters, CR/LF).
            writer.writeLine("$encodeToken = static function (string $value): string {");
            writer.writeLine(
                "    return preg_replace_callback('/[^!#$%&\\'*+\\-.^_`|~0-9A-Za-z]/', static function (array $matches): string {"
            );
            writer.writeLine("        $encoded = '';");
            writer.writeLine("        foreach (str_split($matches[0]) as $char) {");
            writer.writeLine("            $encoded .= '%' . strtoupper(bin2hex($char));");
            writer.writeLine("        }");
            writer.writeLine("        return $encoded;");
            writer.writeLine("    }, $value) ?? '';");
            writer.writeLine("};");
            writer.writeLine();

            // Escape the comment delimiters `(`, `)`, `\` and control characters
            // (0x00-0x1F, 0x7F, incl. CR/LF) so a caller-supplied comment cannot
            // terminate the comment group early or inject additional header content.
            writer.writeLine("$encodeComment = static function (string $value): string {");
            writer.writeLine(
                "    return preg_replace_callback('/[()\\\\\\\\\\x00-\\x1f\\x7f]/', static function (array $matches): string {"
            );
            writer.writeLine("        $encoded = '';");
            writer.writeLine("        foreach (str_split($matches[0]) as $char) {");
            writer.writeLine("            $encoded .= '%' . strtoupper(bin2hex($char));");
            writer.writeLine("        }");
            writer.writeLine("        return $encoded;");
            writer.writeLine("    }, $value) ?? '';");
            writer.writeLine("};");
            writer.writeLine();

            // `name` is a required key of the appInfo shape, so no `?? ''` fallback
            // (PHPStan level max flags the redundant null-coalesce otherwise).
            writer.writeTextStatement("$name = $encodeToken(trim($appInfo['name']))");
            writer.controlFlow("if", php.codeblock("$name === ''"));
            writer.writeTextStatement("return $userAgent");
            writer.endControlFlow();
            writer.writeLine();

            writer.writeTextStatement("$productToken = $name");
            writer.writeTextStatement("$version = $encodeToken(trim($appInfo['version'] ?? ''))");
            writer.controlFlow("if", php.codeblock("$version !== ''"));
            writer.writeTextStatement("$productToken .= '/' . $version");
            writer.endControlFlow();
            writer.writeLine();

            writer.writeTextStatement("$comment = $encodeComment(trim($appInfo['comment'] ?? ''))");
            writer.controlFlow("if", php.codeblock("$comment !== ''"));
            writer.writeTextStatement("$productToken .= ' (' . $comment . ')'");
            writer.endControlFlow();
            writer.writeLine();

            writer.writeTextStatement("return $userAgent . ' ' . $productToken");
        })
    });
}

export class RootClientGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private readonly case: CaseConverter;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.case = context.case;
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(this.context.getRootClientClassName() + ".php"));
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            name: this.context.getRootClientClassName(),
            namespace: this.context.getRootNamespace(),
            interfaceReferences: this.context.customConfig.generateClientInterfaces
                ? [this.context.getRootClientInterfaceClassReference()]
                : undefined
        });

        if (!this.context.ir.rootPackage.hasEndpointsInTree) {
            return this.newRootClientFile(class_);
        }

        const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";

        class_.addField(
            php.field({
                name: `$${this.context.getClientOptionsName()}`,
                access: "private",
                type: this.context.getClientOptionsType(),
                docs: "@phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator"
            })
        );
        class_.addField(this.context.rawClient.getField());

        if (isMultiUrl) {
            class_.addField(
                php.field({
                    name: "$environment",
                    access: "private",
                    type: php.Type.reference(this.context.getEnvironmentsClassReference())
                })
            );
        }

        // Add field for OAuth token provider if using client credentials OAuth.
        // Under ENDPOINT_SECURITY the provider is owned by the RoutingAuthProvider
        // instead, so no root-level field is emitted.
        const oauth = this.context.getOauth();
        if (
            !this.context.isEndpointSecurity() &&
            oauth != null &&
            oauth.configuration.type === "clientCredentials" &&
            this.shouldUseOAuthProvider()
        ) {
            class_.addField(
                php.field({
                    name: "$oauthTokenProvider",
                    access: "private",
                    type: php.Type.reference(
                        php.classReference({
                            name: "OAuthTokenProvider",
                            namespace: this.context.getCoreNamespace()
                        })
                    )
                })
            );
        }

        // Add field for inferred auth provider if using inferred auth
        const inferredAuth = this.context.getInferredAuth();
        if (!this.context.isEndpointSecurity() && inferredAuth != null && !this.shouldUseOAuthProvider()) {
            class_.addField(
                php.field({
                    name: "$inferredAuthProvider",
                    access: "private",
                    type: php.Type.reference(
                        php.classReference({
                            name: "InferredAuthProvider",
                            namespace: this.context.getCoreNamespace()
                        })
                    )
                })
            );
        }

        // Under ENDPOINT_SECURITY, auth is routed per-endpoint through this provider
        // rather than applied flatly to every request.
        if (this.context.isEndpointSecurity()) {
            class_.addField(
                php.field({
                    name: "$routingAuthProvider",
                    access: "private",
                    // Nullable to match the subclient field, which the token providers'
                    // unauthenticated internal auth client is constructed without.
                    type: php.Type.optional(php.Type.reference(this.context.getRoutingAuthProviderClassReference())),
                    docs: "@phpstan-ignore-next-line Property is read in endpoint methods and passed to subclients"
                })
            );
        }

        const subpackages = this.getRootSubpackages();
        const constructorParameters = this.getConstructorParameters();
        class_.addConstructor(
            this.getConstructorMethod({
                constructorParameters,
                subpackages
            })
        );

        for (const subpackage of subpackages) {
            class_.addField(this.context.getSubpackageField(subpackage));
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of service.endpoints) {
                const methods = this.context.endpointGenerator.generate({
                    serviceId: rootServiceId,
                    service,
                    endpoint
                });
                class_.addMethods(methods);
            }
        }

        if (this.context.customConfig.generateClientInterfaces) {
            for (const subpackage of subpackages) {
                class_.addMethod(this.getSubpackageGetterMethod(subpackage));
            }
        }

        // Under `any`-composed multi-scheme auth, missing creds fall back to the env
        // var but never throw (the caller may be using another scheme), so the
        // getFromEnvOrThrow helper is not emitted.
        if (
            !this.isAnyAuthWithMultipleSchemes() &&
            !this.context.isEndpointSecurity() &&
            constructorParameters.optional.some(
                (parameter) =>
                    parameter.environmentVariable != null && !(parameter.isGlobalHeader && parameter.isOptional)
            )
        ) {
            class_.addMethod(this.getFromEnvOrThrowMethod());
        }

        const userAgent = this.context.getUserAgent();
        if (
            !this.context.customConfig.omitFernHeaders &&
            this.context.customConfig.includePlatformHeaders &&
            userAgent != null
        ) {
            class_.addMethod(this.getPlatformUserAgentMethod(userAgent.value));
        }

        // Emit the self-contained appInfo appender only when the opt-in
        // `allowUserAgentAppInfo` config is enabled and a User-Agent is actually
        // sent, so that clients which do not opt in keep byte-identical output.
        if (
            !this.context.customConfig.omitFernHeaders &&
            this.context.customConfig.allowUserAgentAppInfo &&
            userAgent != null
        ) {
            class_.addMethod(this.getAppendAppInfoToUserAgentMethod());
        }

        return this.newRootClientFile(class_);
    }

    private getConstructorMethod({
        constructorParameters,
        subpackages
    }: {
        constructorParameters: ConstructorParameters;
        subpackages: FernIr.Subpackage[];
    }): php.Class.Constructor {
        const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";
        const hasDefaultEnvironment = this.context.ir.environments?.defaultEnvironment != null;
        // Under `any`-composed auth with more than one scheme, each scheme's
        // credentials are independently optional: the caller supplies exactly one
        // scheme's creds. We must not throw for missing creds, must set each
        // scheme's header only when its cred is present, and must only wire up a
        // token provider when that scheme's creds were actually supplied.
        const anyAuthMultiScheme = this.isAnyAuthWithMultipleSchemes();
        // Under ENDPOINT_SECURITY, auth is applied per-endpoint via the RoutingAuthProvider,
        // so no auth headers are baked into the static default headers and no flat
        // getAuthHeaders callback is installed. Each auth param stays optional and env-var
        // fallbacks never throw (a caller may only use a subset of the schemes).
        const endpointSecurity = this.context.isEndpointSecurity();
        const preferExplicitAuth = this.preferExplicitAuthEnabled();
        const serverVariableOptions = getServerVariableOptions(
            this.context.ir.environments,
            this.case,
            constructorParameters.all.map((parameter) => parameter.name)
        );

        const parameters: php.Parameter[] = [];
        for (const param of [...constructorParameters.required, ...constructorParameters.optional]) {
            let type = this.context.phpTypeMapper.convert({ reference: param.typeReference });
            if (param.clientDefault != null && !this.context.isOptional(param.typeReference)) {
                type = php.Type.optional(type);
            }
            parameters.push(
                php.parameter({
                    name: param.name,
                    type,
                    docs: param.docs
                })
            );
        }
        for (const param of constructorParameters.literal) {
            parameters.push(
                php.parameter({
                    name: param.name,
                    type: this.getLiteralRootClientParameterType({ literal: param.value }),
                    docs: param.docs
                })
            );
        }

        if (isMultiUrl) {
            const environmentType = hasDefaultEnvironment
                ? php.Type.optional(php.Type.reference(this.context.getEnvironmentsClassReference()))
                : php.Type.reference(this.context.getEnvironmentsClassReference());

            parameters.push(
                php.parameter({
                    name: "environment",
                    type: environmentType,
                    initializer: hasDefaultEnvironment ? php.codeblock("null") : undefined,
                    docs: "The environment to use for API requests."
                })
            );
        }

        for (const option of serverVariableOptions) {
            parameters.push(
                php.parameter({
                    name: option.optionName,
                    type: php.Type.optional(php.Type.string()),
                    initializer: php.codeblock("null"),
                    docs: this.getServerVariableParameterDocs(option)
                })
            );
        }

        parameters.push(
            php.parameter({
                name: this.context.getClientOptionsName(),
                type: php.Type.optional(this.context.getClientOptionsType()),
                initializer: php.codeblock("null")
            })
        );

        const headerEntries: php.Map.Entry[] = [];
        for (const param of constructorParameters.required) {
            // Under ENDPOINT_SECURITY, auth-scheme headers are routed per-endpoint and must
            // not be baked into the default headers; global (non-auth) headers still are.
            if (param.header != null && (!endpointSecurity || param.isGlobalHeader)) {
                headerEntries.push({
                    key: php.codeblock(`'${param.header.name}'`),
                    value: this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                });
            }
        }
        for (const param of constructorParameters.optional) {
            // Under `any`-composed multi-scheme auth, env-var-backed auth headers are
            // written conditionally below (only when the cred is present) instead of
            // being baked into the static default headers map.
            if (
                param.header != null &&
                param.environmentVariable != null &&
                !anyAuthMultiScheme &&
                (!endpointSecurity || param.isGlobalHeader) &&
                !(param.isGlobalHeader && param.isOptional && param.clientDefault == null)
            ) {
                // Variables backed by an environment variable can be instantiated in-line.
                headerEntries.push({
                    key: php.codeblock(`'${param.header.name}'`),
                    value: this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                });
            }
        }

        for (const param of constructorParameters.literal) {
            if (param.header != null) {
                headerEntries.push({
                    key: php.codeblock(`'${param.header.name}'`),
                    value: php.codeblock(this.context.getLiteralAsString(param.value))
                });
            }
        }

        if (!this.context.customConfig.omitFernHeaders) {
            const platformHeaders = this.context.ir.sdkConfig.platformHeaders;
            headerEntries.push({
                key: php.codeblock(`'${platformHeaders.language}'`),
                value: php.codeblock("'PHP'")
            });
            headerEntries.push({
                key: php.codeblock(`'${platformHeaders.sdkName}'`),
                value: php.codeblock(`'${this.context.getRootNamespace()}'`)
            });
            const sdkVersion = this.context.getSdkVersion();
            if (sdkVersion != null) {
                headerEntries.push({
                    key: php.codeblock(`'${platformHeaders.sdkVersion}'`),
                    value: php.codeblock(`'${sdkVersion}'`)
                });
            }
            const userAgent = this.context.getUserAgent();
            if (userAgent != null) {
                const escapedUserAgentValue = userAgent.value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                // The base User-Agent expression, covering all three branches: the
                // structured platform value, the `user-agent` template value, and the
                // default `{package}/{version}` (the latter two both surface via
                // `userAgent.value`).
                const baseUserAgentExpression = this.context.customConfig.includePlatformHeaders
                    ? `self::${GET_PLATFORM_USER_AGENT}(strtolower(PHP_OS), php_uname('m'), PHP_VERSION)`
                    : `'${escapedUserAgentValue}'`;
                // When `allowUserAgentAppInfo` is enabled, append the caller-supplied
                // `appInfo` product token to whichever User-Agent value the SDK would
                // otherwise send. `$options['appInfo']` is in scope in the constructor.
                const userAgentExpression = this.context.customConfig.allowUserAgentAppInfo
                    ? `self::${APPEND_APP_INFO_TO_USER_AGENT}(${baseUserAgentExpression}, $${this.context.getClientOptionsName()}['${this.context.getAppInfoOptionName()}'] ?? null)`
                    : baseUserAgentExpression;
                headerEntries.push({
                    key: php.codeblock(`'${userAgent.header}'`),
                    value: php.codeblock(userAgentExpression)
                });
            }
        }

        if (this.context.ir.apiVersion != null) {
            const apiVersion = this.context.ir.apiVersion;
            const headerKey = apiVersion._visit({
                header: (header) => {
                    return getWireValue(header.header.name);
                },
                _other: () => {
                    return undefined;
                }
            });
            const headerValue = apiVersion._visit({
                header: (header) => {
                    return header.value.default?.name != null ? getWireValue(header.value.default.name) : undefined;
                },
                _other: () => {
                    return undefined;
                }
            });
            this.context.logger.debug(`headerKey: ${headerKey}`);
            this.context.logger.debug(`headerValue: ${headerValue}`);
            if (headerKey != null && headerValue != null) {
                headerEntries.push({
                    key: php.codeblock(`'${headerKey}'`),
                    value: php.codeblock(`'${headerValue}'`)
                });
            }
        }

        const headers = php.map({
            entries: headerEntries,
            multiline: true
        });
        return {
            access: "public",
            parameters,
            body: php.codeblock((writer) => {
                if (preferExplicitAuth) {
                    // Record which credentials were passed explicitly, before the env-var
                    // fallbacks below overwrite null parameters, so explicitly provided
                    // basic auth wins over env-var-derived OAuth credentials.
                    writer.writeTextStatement("$explicitOAuthAuth = $clientId !== null || $clientSecret !== null");
                    writer.writeTextStatement(
                        `$explicitBasicAuth = ${this.getBasicAuthCredentialParameterNames()
                            .map((name) => `$${name} !== null`)
                            .join(" || ")}`
                    );
                }
                for (const param of constructorParameters.optional) {
                    if (param.environmentVariable != null) {
                        if (param.clientDefault != null) {
                            const defaultWire = this.getClientDefaultLiteralWireValue(param.clientDefault);
                            const escaped = defaultWire.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                            writer.writeLine(`$envValue = getenv('${param.environmentVariable}');`);
                            writer.writeTextStatement(
                                `$${param.name} ??= ($envValue !== false ? $envValue : '${escaped}')`
                            );
                        } else if (
                            anyAuthMultiScheme ||
                            endpointSecurity ||
                            (param.isGlobalHeader && param.isOptional)
                        ) {
                            // Fall back to the env var if present, but do not throw when it is
                            // missing — an optional header may simply be unset, and under
                            // `any`-composed or endpoint-security auth the caller may be using
                            // only a subset of the schemes.
                            writer.writeTextStatement(
                                `$${param.name} ??= getenv('${param.environmentVariable}') ?: null`
                            );
                        } else {
                            writer.write(`$${param.name} ??= `);
                            writer.writeNodeStatement(
                                php.invokeMethod({
                                    method: `$this->${GET_FROM_ENV_OR_THROW}`,
                                    arguments_: [
                                        php.codeblock(`'${param.environmentVariable}'`),
                                        php.codeblock(
                                            `'Please pass in ${param.name} or set the environment variable ${param.environmentVariable}.'`
                                        )
                                    ]
                                })
                            );
                        }
                    }
                }

                for (const param of constructorParameters.optional) {
                    if (param.clientDefault != null && param.environmentVariable == null) {
                        const defaultWire = this.getClientDefaultLiteralWireValue(param.clientDefault);
                        const escaped = defaultWire.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                        writer.writeTextStatement(`$${param.name} ??= '${escaped}'`);
                    }
                }

                writer.write("$defaultHeaders = ");
                writer.writeNodeStatement(headers);
                for (const param of constructorParameters.optional) {
                    if (
                        param.header != null &&
                        (!endpointSecurity || param.isGlobalHeader) &&
                        (param.environmentVariable == null ||
                            anyAuthMultiScheme ||
                            (param.isGlobalHeader && param.isOptional && param.clientDefault == null))
                    ) {
                        writer.controlFlow("if", php.codeblock(`$${param.name} != null`));
                        writer.write(`$defaultHeaders['${param.header.name}'] = `);
                        writer.writeNodeStatement(
                            this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                        );
                        writer.endControlFlow();
                    }
                }
                for (const param of constructorParameters.literal) {
                    if (param.header != null) {
                        writer.controlFlow("if", php.codeblock(`$${param.name} !== null`));
                        writer.write(`$defaultHeaders['${param.header.name}'] = `);
                        if (param.value.type === "boolean") {
                            writer.writeTextStatement(`$${param.name} ? 'true' : 'false'`);
                        } else {
                            writer.writeNodeStatement(
                                this.getHeaderValue({ prefix: param.header.prefix, parameterName: param.name })
                            );
                        }
                        writer.endControlFlow();
                    }
                }

                // Add Basic Auth header if applicable
                const basicAuthSchemes = this.context.ir.auth.schemes.filter(
                    (s): s is typeof s & { type: "basic" } => s.type === "basic"
                );
                const resolvedBasicAuthSchemes = basicAuthSchemes
                    .map((scheme) => this.resolveBasicAuthScheme(scheme))
                    .filter((resolved) => resolved != null);
                // Under ENDPOINT_SECURITY, basic auth is routed per-endpoint, not baked in.
                if (resolvedBasicAuthSchemes.length > 0 && !endpointSecurity) {
                    const isAuthOptional = !this.context.ir.sdkConfig.isAuthMandatory || anyAuthMultiScheme;
                    const needsControlFlow = isAuthOptional || resolvedBasicAuthSchemes.length > 1;
                    let hasWrittenIf = false;
                    for (const resolved of resolvedBasicAuthSchemes) {
                        if (resolved == null) {
                            continue;
                        }
                        const { condition, credentialExpr } = resolved;
                        const hasCondition = needsControlFlow && condition.length > 0;
                        if (hasCondition) {
                            writer.controlFlow(hasWrittenIf ? "else if" : "if", php.codeblock(condition));
                            hasWrittenIf = true;
                        }
                        writer.writeLine(
                            `$defaultHeaders['Authorization'] = "Basic " . base64_encode(${credentialExpr});`
                        );
                        if (hasCondition) {
                            writer.endControlFlow();
                        }
                    }
                }

                writer.writeLine();

                writer.writeNodeStatement(
                    php.codeblock((writer) => {
                        writer.write(`$this->${this.context.getClientOptionsName()} = `);
                        writer.writeNode(php.variable(this.context.getClientOptionsName()));
                        writer.write(" ?? []");
                    })
                );

                this.writeServerVariableInterpolation({ writer, serverVariableOptions });

                if (isMultiUrl && hasDefaultEnvironment) {
                    const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
                    if (defaultEnvironmentId != null) {
                        const environmentName = this.context.ir.environments?.environments._visit({
                            multipleBaseUrls: (value) => {
                                return value.environments.find((env) => env.id === defaultEnvironmentId)?.name;
                            },
                            singleBaseUrl: () => undefined,
                            _other: () => undefined
                        });
                        if (environmentName != null) {
                            writer.write("$environment ??= ");
                            writer.writeNodeStatement(
                                php.codeblock((writer) => {
                                    writer.writeNode(this.context.getEnvironmentsClassReference());
                                    writer.write(`::${this.context.getEnvironmentName(environmentName)}()`);
                                })
                            );
                        }
                    }
                }

                if (isMultiUrl) {
                    writer.writeTextStatement("$this->environment = $environment");
                }
                writer.writeLine();

                // OAuth and inferred auth provider setup - moved after environment setup
                const oauth = this.context.getOauth();
                const inferredAuth = this.context.getInferredAuth();
                const hasOAuth =
                    oauth != null && oauth.configuration.type === "clientCredentials" && this.shouldUseOAuthProvider();
                const hasInferredAuth = inferredAuth != null && !this.shouldUseOAuthProvider();
                const oauthCredGuard = preferExplicitAuth
                    ? "$clientId !== null && $clientSecret !== null && ($explicitOAuthAuth || !$explicitBasicAuth)"
                    : "$clientId !== null && $clientSecret !== null";
                const inferredCredGuard =
                    inferredAuth != null ? this.getInferredAuthCredentialGuard(inferredAuth) : null;

                // The internal (unauthenticated) auth client used to fetch OAuth / inferred tokens
                // must target the same base URL as the main client when one is configured,
                // otherwise the token request never reaches the configured server (e.g. a
                // WireMock instance in wire tests). When no base URL is supplied the key is
                // omitted so the default-environment fallback still applies. Multi-URL
                // environments are threaded through the `$environment` constructor argument
                // instead, so only inject the base URL here for single-URL clients.
                const clientOptionsName = this.context.getClientOptionsName();
                const clientBaseUrlOption = this.context.getBaseUrlOptionName();
                const authRawClientOptions = isMultiUrl
                    ? "['headers' => []]"
                    : `isset($this->${clientOptionsName}['${clientBaseUrlOption}']) ? ['${clientBaseUrlOption}' => $this->${clientOptionsName}['${clientBaseUrlOption}'], 'headers' => []] : ['headers' => []]`;

                if (!endpointSecurity && hasOAuth && oauth != null) {
                    if (anyAuthMultiScheme) {
                        writer.controlFlow("if", php.codeblock(oauthCredGuard));
                    }
                    this.writeOAuthProviderSetup(
                        writer,
                        oauth,
                        isMultiUrl,
                        anyAuthMultiScheme,
                        undefined,
                        authRawClientOptions
                    );
                    if (anyAuthMultiScheme) {
                        writer.endControlFlow();
                    }
                }

                if (!endpointSecurity && hasInferredAuth && inferredAuth != null) {
                    const guardInferred = anyAuthMultiScheme && inferredCredGuard != null;
                    if (guardInferred) {
                        writer.controlFlow("if", php.codeblock(inferredCredGuard));
                    }
                    this.writeInferredAuthProviderSetup(
                        writer,
                        inferredAuth,
                        isMultiUrl,
                        constructorParameters,
                        guardInferred,
                        undefined,
                        authRawClientOptions
                    );
                    if (guardInferred) {
                        writer.endControlFlow();
                    }
                }

                // Update client options with the updated headers
                writer.write(
                    `$this->${this.context.getClientOptionsName()}['${this.context.getHeadersOptionName()}'] = `
                );
                writer.writeNodeStatement(
                    php.invokeMethod({
                        method: "array_merge",
                        arguments_: [
                            php.codeblock("$defaultHeaders"),
                            php.codeblock(
                                `$this->${this.context.getClientOptionsName()}['${this.context.getHeadersOptionName()}'] ?? []`
                            )
                        ],
                        multiline: true
                    })
                );
                writer.writeLine();

                // Under ENDPOINT_SECURITY, build the RoutingAuthProvider (which owns any
                // OAuth / inferred token providers) that routes auth per-endpoint.
                if (endpointSecurity) {
                    this.writeRoutingAuthProviderSetup({ writer, isMultiUrl, constructorParameters });
                }

                // Build the RawClient options, including getAuthHeaders callback if using OAuth or InferredAuth
                if (!endpointSecurity && (hasOAuth || hasInferredAuth)) {
                    // Only install the getAuthHeaders callback when the corresponding token
                    // provider was set up; under `any`-composed auth that only happens when
                    // the scheme's creds were supplied.
                    const callbackGuard = anyAuthMultiScheme ? (hasOAuth ? oauthCredGuard : inferredCredGuard) : null;
                    if (callbackGuard != null) {
                        writer.controlFlow("if", php.codeblock(callbackGuard));
                    }
                    writer.writeLine(`$this->${this.context.getClientOptionsName()}['getAuthHeaders'] = fn () => `);
                    if (hasOAuth) {
                        writer.writeLine(
                            "    ['Authorization' => \"Bearer \" . $this->oauthTokenProvider->getToken()];"
                        );
                    } else if (hasInferredAuth) {
                        writer.writeLine("    $this->inferredAuthProvider->getAuthHeaders();");
                    }
                    if (callbackGuard != null) {
                        writer.endControlFlow();
                    }
                    writer.writeLine();
                }

                writer.write("$this->client = ");
                writer.writeNodeStatement(
                    this.context.rawClient.instantiate({
                        arguments_: [
                            {
                                name: "options",
                                assignment: php.codeblock((writer) => {
                                    const clientOptions = `$this->${this.context.getClientOptionsName()}`;
                                    writer.write(clientOptions);
                                })
                            }
                        ]
                    })
                );

                if (subpackages.length > 0) {
                    writer.writeLine();
                }

                for (const subpackage of subpackages) {
                    writer.write(`$this->${this.case.camelSafe(subpackage.name)} = `);

                    const subClientArgs: php.AstNode[] = [
                        php.codeblock(`$this->${this.context.rawClient.getFieldName()}`)
                    ];

                    if (isMultiUrl) {
                        subClientArgs.push(php.codeblock(`$this->environment`));
                    } else {
                        subClientArgs.push(php.codeblock(`$this->${this.context.getClientOptionsName()}`));
                    }

                    // Pass the shared RoutingAuthProvider down so subclient endpoints can
                    // route their own auth headers.
                    if (endpointSecurity) {
                        subClientArgs.push(php.codeblock("$this->routingAuthProvider"));
                    }

                    writer.writeNodeStatement(
                        php.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
                            arguments_: subClientArgs
                        })
                    );
                }
            })
        };
    }

    /**
     * Emits the ENDPOINT_SECURITY auth wiring: constructs any OAuth / inferred token
     * providers as locals (only when their credentials were supplied) and hands them,
     * along with the raw bearer / header / basic credentials, to a RoutingAuthProvider
     * stored on the client. Endpoint methods then call it per request to apply only the
     * schemes that endpoint declares.
     */
    private writeRoutingAuthProviderSetup({
        writer,
        isMultiUrl,
        constructorParameters
    }: {
        writer: php.Writer;
        isMultiUrl: boolean;
        constructorParameters: ConstructorParameters;
    }): void {
        const routingSchemes = getRoutingSchemes(this.context);
        const oauth = this.context.getOauth();
        const inferredAuth = this.context.getInferredAuth();
        const hasOAuthScheme = oauth != null && oauth.configuration.type === "clientCredentials";
        const hasInferredScheme = inferredAuth != null;

        // The internal (unauthenticated) auth client used to fetch OAuth / inferred tokens must
        // target the same base URL as the main client, otherwise the token request never reaches
        // the configured server (e.g. a WireMock instance in wire tests). Multi-URL environments
        // are threaded through the `$environment` constructor argument instead, so only inject the
        // base URL here for single-URL clients.
        const optionsName = this.context.getClientOptionsName();
        const baseUrlOption = this.context.getBaseUrlOptionName();
        const authRawClientOptions = isMultiUrl
            ? "['headers' => []]"
            : `isset($this->${optionsName}['${baseUrlOption}']) ? ['${baseUrlOption}' => $this->${optionsName}['${baseUrlOption}'], 'headers' => []] : ['headers' => []]`;

        if (hasOAuthScheme && oauth != null) {
            writer.writeTextStatement("$oauthTokenProvider = null");
            writer.controlFlow("if", php.codeblock("$clientId !== null && $clientSecret !== null"));
            this.writeOAuthProviderSetup(writer, oauth, isMultiUrl, true, "$oauthTokenProvider", authRawClientOptions);
            writer.endControlFlow();
        }

        if (hasInferredScheme && inferredAuth != null) {
            const inferredCredGuard = this.getInferredAuthCredentialGuard(inferredAuth);
            writer.writeTextStatement("$inferredAuthProvider = null");
            if (inferredCredGuard != null) {
                writer.controlFlow("if", php.codeblock(inferredCredGuard));
            }
            this.writeInferredAuthProviderSetup(
                writer,
                inferredAuth,
                isMultiUrl,
                constructorParameters,
                true,
                "$inferredAuthProvider",
                authRawClientOptions
            );
            if (inferredCredGuard != null) {
                writer.endControlFlow();
            }
        }

        writer.write("$this->routingAuthProvider = ");
        writer.writeNodeStatement(
            php.instantiateClass({
                classReference: this.context.getRoutingAuthProviderClassReference(),
                arguments_: routingSchemes.flatMap((scheme): php.AstNode[] => {
                    switch (scheme.kind) {
                        case "bearer":
                        case "header":
                            return [php.codeblock(`$${scheme.paramName}`)];
                        case "basic": {
                            const args: php.AstNode[] = [];
                            if (scheme.usernameParam != null) {
                                args.push(php.codeblock(`$${scheme.usernameParam}`));
                            }
                            if (scheme.passwordParam != null) {
                                args.push(php.codeblock(`$${scheme.passwordParam}`));
                            }
                            return args;
                        }
                        case "oauth":
                            return [php.codeblock("$oauthTokenProvider")];
                        case "inferred":
                            return [php.codeblock("$inferredAuthProvider")];
                        default:
                            return [];
                    }
                }),
                multiline: true
            })
        );
        writer.writeLine();
    }

    private getServerVariableParameterDocs(option: ServerVariableOption): string {
        const docs: string[] = [];
        if (option.variable.values != null && option.variable.values.length > 0) {
            docs.push(
                `The ${option.optionName} to route requests to. Allowed values: ${option.variable.values.join(", ")}.`
            );
        } else {
            docs.push(`The ${option.optionName} to substitute into the base URL.`);
        }
        if (option.variable.default != null) {
            docs.push(`Defaults to "${option.variable.default}".`);
        } else {
            docs.push("Required when any other server URL variable is provided.");
        }
        return docs.join(" ");
    }

    /**
     * Emits interpolation of server URL variables (e.g. region/edge) into the base URL(s).
     * When the API declares server variables, each is exposed as an optional constructor
     * parameter; if any is provided the base URL(s) are rebuilt from the environment's URL
     * template(s), falling back to each variable's IR default when it is not provided.
     * Emits nothing when the API declares no server variables, leaving output unchanged.
     */
    private writeServerVariableInterpolation({
        writer,
        serverVariableOptions
    }: {
        writer: php.Writer;
        serverVariableOptions: ServerVariableOption[];
    }): void {
        if (serverVariableOptions.length === 0) {
            return;
        }
        const config = this.context.ir.environments;
        if (config == null) {
            return;
        }
        const environments = config.environments;

        const anyProvided = serverVariableOptions.map((option) => `$${option.optionName} != null`).join(" || ");
        const writeMissingDefaultGuards = (): void => {
            for (const option of serverVariableOptions) {
                if (option.variable.default == null) {
                    writer.controlFlow("if", php.codeblock(`$${option.optionName} == null`));
                    writer.writeTextStatement(
                        `throw new \\InvalidArgumentException('${option.optionName} is required when overriding the server URL with variables.')`
                    );
                    writer.endControlFlow();
                }
            }
        };
        const writeDefaults = (): void => {
            // With a single variable, the enclosing guard already ensures it is non-null,
            // so a `??=` default would be dead code (and rejected by phpstan).
            if (serverVariableOptions.length === 1) {
                return;
            }
            for (const option of serverVariableOptions) {
                if (option.variable.default != null) {
                    writer.writeTextStatement(
                        `$${option.optionName} ??= '${this.escapeSingleQuoted(option.variable.default)}'`
                    );
                }
            }
        };

        switch (environments.type) {
            case "singleBaseUrl": {
                const fallbackEnvironment = getSingleBaseUrlTemplatedEnvironment(config);
                if (fallbackEnvironment?.urlTemplate == null) {
                    return;
                }
                const templatedEnvironments = environments.environments.filter(
                    (environment): environment is FernIr.SingleBaseUrlEnvironment & { urlTemplate: string } =>
                        environment.urlTemplate != null
                );
                const optionsName = this.context.getClientOptionsName();
                const environmentValueExpression = (environment: FernIr.SingleBaseUrlEnvironment): php.CodeBlock =>
                    php.codeblock((w) => {
                        w.writeNode(this.context.getEnvironmentsClassReference());
                        w.write(`::${this.context.getEnvironmentName(environment.name)}->value`);
                    });
                writer.controlFlow("if", php.codeblock(anyProvided));
                writer.writeTextStatement(`$baseUrl = $this->${optionsName}['baseUrl'] ?? null`);
                writer.controlFlow(
                    "if",
                    php.codeblock((w) => {
                        w.write("$baseUrl == null");
                        for (const environment of templatedEnvironments) {
                            w.write(" || $baseUrl === ");
                            w.writeNode(environmentValueExpression(environment));
                        }
                    })
                );
                writeMissingDefaultGuards();
                writeDefaults();
                const alternativeEnvironments = templatedEnvironments.filter(
                    (environment) => environment.id !== fallbackEnvironment.id
                );
                let hasWrittenBranch = false;
                for (const environment of alternativeEnvironments) {
                    const condition = php.codeblock((w) => {
                        w.write("$baseUrl === ");
                        w.writeNode(environmentValueExpression(environment));
                    });
                    if (!hasWrittenBranch) {
                        writer.controlFlow("if", condition);
                        hasWrittenBranch = true;
                    } else {
                        writer.contiguousControlFlow("elseif", condition);
                    }
                    writer.writeTextStatement(
                        `$this->${optionsName}['baseUrl'] = ${urlTemplateToPhpConcatenation(
                            environment.urlTemplate,
                            serverVariableOptions
                        )}`
                    );
                }
                if (hasWrittenBranch) {
                    writer.alternativeControlFlow("else");
                }
                writer.writeTextStatement(
                    `$this->${optionsName}['baseUrl'] = ${urlTemplateToPhpConcatenation(
                        fallbackEnvironment.urlTemplate,
                        serverVariableOptions
                    )}`
                );
                if (hasWrittenBranch) {
                    writer.endControlFlow();
                }
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeLine();
                return;
            }
            case "multipleBaseUrls": {
                const fallbackEnvironment = getMultipleBaseUrlsTemplatedEnvironment(config);
                if (fallbackEnvironment?.urlTemplates == null) {
                    return;
                }
                const templatedEnvironments = environments.environments.filter(
                    (environment) => environment.urlTemplates != null
                );
                const environmentConstantExpression = (
                    environment: FernIr.MultipleBaseUrlsEnvironment
                ): php.CodeBlock =>
                    php.codeblock((w) => {
                        w.writeNode(this.context.getEnvironmentsClassReference());
                        w.write(`::${this.context.getEnvironmentName(environment.name)}()`);
                    });
                const writeCustomEnvironmentAssignment = (environment: FernIr.MultipleBaseUrlsEnvironment): void => {
                    const templates = environment.urlTemplates ?? {};
                    const staticUrls = environment.urls;
                    writer.write("$environment = ");
                    writer.writeNodeStatement(
                        php.codeblock((w) => {
                            w.writeNode(this.context.getEnvironmentsClassReference());
                            w.write("::custom(");
                            w.indent();
                            w.newLine();
                            environments.baseUrls.forEach((baseUrl, index) => {
                                const propertyName = this.case.camelSafe(baseUrl.name);
                                const template = templates[baseUrl.id];
                                const value =
                                    template != null
                                        ? urlTemplateToPhpConcatenation(template, serverVariableOptions)
                                        : `'${this.escapeSingleQuoted(staticUrls[baseUrl.id] ?? "")}'`;
                                w.write(`${propertyName}: ${value}`);
                                if (index < environments.baseUrls.length - 1) {
                                    w.write(",");
                                }
                                w.newLine();
                            });
                            w.dedent();
                            w.write(")");
                        })
                    );
                };
                writer.controlFlow("if", php.codeblock(anyProvided));
                writer.controlFlow(
                    "if",
                    php.codeblock((w) => {
                        w.write("$environment == null");
                        for (const environment of templatedEnvironments) {
                            w.write(" || $environment == ");
                            w.writeNode(environmentConstantExpression(environment));
                        }
                    })
                );
                writeMissingDefaultGuards();
                writeDefaults();
                const alternativeEnvironments = templatedEnvironments.filter(
                    (environment) => environment.id !== fallbackEnvironment.id
                );
                let hasWrittenBranch = false;
                for (const environment of alternativeEnvironments) {
                    const condition = php.codeblock((w) => {
                        w.write("$environment == ");
                        w.writeNode(environmentConstantExpression(environment));
                    });
                    if (!hasWrittenBranch) {
                        writer.controlFlow("if", condition);
                        hasWrittenBranch = true;
                    } else {
                        writer.contiguousControlFlow("elseif", condition);
                    }
                    writeCustomEnvironmentAssignment(environment);
                }
                if (hasWrittenBranch) {
                    writer.alternativeControlFlow("else");
                }
                writeCustomEnvironmentAssignment(fallbackEnvironment);
                if (hasWrittenBranch) {
                    writer.endControlFlow();
                }
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeLine();
                return;
            }
            default:
                assertNever(environments);
        }
    }

    private escapeSingleQuoted(value: string): string {
        return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }

    private getSubpackageGetterMethod(subpackage: FernIr.Subpackage): php.Method {
        return php.method({
            name: this.context.getSubpackageGetterName(subpackage),
            access: "public",
            parameters: [],
            return_: php.Type.reference(this.context.getSubpackageInterfaceClassReference(subpackage)),
            body: php.codeblock((writer) => {
                writer.writeTextStatement(`return $this->${this.case.camelSafe(subpackage.name)}`);
            })
        });
    }

    private getFromEnvOrThrowMethod(): php.Method {
        return php.method({
            access: "private",
            name: GET_FROM_ENV_OR_THROW,
            return_: php.Type.string(),
            parameters: [
                php.parameter({
                    name: "env",
                    type: php.Type.string()
                }),
                php.parameter({
                    name: "message",
                    type: php.Type.string()
                })
            ],
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$value = getenv($env)");
                writer.write("return $value ? (string) $value : throw new ");
                writer.writeNode(this.context.getExceptionClassReference());
                writer.writeTextStatement("($message)");
            })
        });
    }

    private getPlatformUserAgentMethod(baseUserAgent: string): php.Method {
        const escapedBase = baseUserAgent.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        return php.method({
            access: "private",
            static_: true,
            name: GET_PLATFORM_USER_AGENT,
            return_: php.Type.string(),
            parameters: [
                php.parameter({ name: "os", type: php.Type.string() }),
                php.parameter({ name: "arch", type: php.Type.string() }),
                php.parameter({ name: "runtimeVersion", type: php.Type.string() })
            ],
            body: php.codeblock((writer) => {
                // Collapse the 64-bit x86 aliases (x64, amd64, x86_64) to the canonical x86_64.
                writer.writeTextStatement(
                    "$arch = in_array(strtolower($arch), ['x64', 'amd64', 'x86_64'], true) ? 'x86_64' : $arch"
                );
                writer.writeTextStatement(
                    "$segments = array_values(array_filter([$os, $arch], fn ($value) => $value !== ''))"
                );
                writer.writeTextStatement(
                    "$platform = count($segments) > 0 ? ' (' . implode('; ', $segments) . ')' : ''"
                );
                writer.writeTextStatement("$runtime = $runtimeVersion !== '' ? 'PHP/' . $runtimeVersion : 'PHP'");
                writer.writeTextStatement(`return '${escapedBase}' . $platform . ' ' . $runtime`);
            })
        });
    }

    /**
     * Emits the self-contained `appendAppInfoToUserAgent` helper into the generated
     * root client (only when `allowUserAgentAppInfo` is enabled). It is standalone so
     * that clients which do not opt in keep byte-identical generated output.
     *
     * Sanitizes caller-supplied values: `name`/`version` are token-encoded (every
     * non-RFC-7230 `tchar` is percent-encoded, including spaces, control characters
     * and CR/LF) and `comment` has its delimiters (`(`, `)`, `\`) and control
     * characters escaped, so the untrusted values cannot inject additional header
     * content. Each value is trimmed before checking for blankness and before
     * encoding, so blank values are treated as absent rather than encoded into
     * whitespace tokens. Formats the appended product token as
     * `{name}/{version} ({comment})`, dropping `/version` and ` (comment)` when blank,
     * and returns the User-Agent unchanged when `appInfo`/`name` is absent.
     */
    private getAppendAppInfoToUserAgentMethod(): php.Method {
        return buildAppendAppInfoToUserAgentMethod();
    }

    private getConstructorParameters(): ConstructorParameters {
        const allParameters: ConstructorParameter[] = [];
        const requiredParameters: ConstructorParameter[] = [];
        const optionalParameters: ConstructorParameter[] = [];
        const literalParameters: LiteralParameter[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            allParameters.push(...this.getParameterForAuthScheme(scheme));
        }

        for (const header of this.context.ir.headers) {
            allParameters.push(this.getParameterForHeader(header));
        }

        // Under ENDPOINT_SECURITY multiple schemes can derive the same credential parameter
        // (e.g. an OAuth scheme and an inferred-auth scheme that share a token endpoint both
        // surface `clientId`/`clientSecret`). Collapse duplicates by name so the generated
        // constructor stays valid PHP.
        const dedupedParameters = this.context.isEndpointSecurity()
            ? allParameters.filter(
                  (param, index) => allParameters.findIndex((other) => other.name === param.name) === index
              )
            : allParameters;

        for (const param of dedupedParameters) {
            if (param.isOptional || param.environmentVariable != null || param.clientDefault != null) {
                optionalParameters.push(param);
                continue;
            }
            const literal = this.context.maybeLiteral(param.typeReference);
            if (literal != null) {
                literalParameters.push({
                    name: param.name,
                    value: literal,
                    docs: param.docs,
                    header: param.header,
                    environmentVariable: param.environmentVariable
                });
                continue;
            }
            requiredParameters.push(param);
        }

        return {
            all: dedupedParameters,
            required: requiredParameters,
            optional: optionalParameters,
            literal: literalParameters
        };
    }

    private getParameterForAuthScheme(scheme: FernIr.AuthScheme): ConstructorParameter[] {
        const isOptional =
            !this.context.ir.sdkConfig.isAuthMandatory ||
            this.isAnyAuthWithMultipleSchemes() ||
            this.context.isEndpointSecurity();
        switch (scheme.type) {
            case "bearer": {
                const name = this.context.getParameterName(scheme.token);
                return [
                    {
                        name,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name }),
                        isOptional,
                        header: BEARER_HEADER_INFO,
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: STRING_TYPE_REFERENCE,
                            envVar: scheme.tokenEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.tokenEnvVar
                    }
                ];
            }
            case "basic": {
                const username = this.context.getParameterName(scheme.username);
                const password = this.context.getParameterName(scheme.password);
                // When omit is true, the field is completely removed from the end-user API.
                const usernameOmitted = !!scheme.usernameOmit;
                const passwordOmitted = !!scheme.passwordOmit;
                const params: ConstructorParameter[] = [];
                if (!usernameOmitted) {
                    params.push({
                        name: username,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name: username }),
                        isOptional,
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: STRING_TYPE_REFERENCE,
                            envVar: scheme.usernameEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.usernameEnvVar
                    });
                }
                if (!passwordOmitted) {
                    params.push({
                        name: password,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name: password }),
                        isOptional,
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: STRING_TYPE_REFERENCE,
                            envVar: scheme.passwordEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.passwordEnvVar
                    });
                }
                return params;
            }
            case "header": {
                const name = this.context.getParameterName(scheme.name);
                return [
                    {
                        name,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name }),
                        isOptional,
                        header: {
                            name: getWireValue(scheme.name),
                            prefix: scheme.prefix
                        },
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: scheme.valueType,
                            envVar: scheme.headerEnvVar,
                            isOptional
                        }),
                        environmentVariable: scheme.headerEnvVar
                    }
                ];
            }
            case "oauth": {
                // If there's already a bearer scheme, skip OAuth parameters
                if (this.context.ir.auth.schemes.some((s) => s.type === "bearer")) {
                    return [];
                }
                const oauthConfig = scheme.configuration;
                if (oauthConfig.type === "clientCredentials") {
                    const params: ConstructorParameter[] = [
                        {
                            name: "clientId",
                            docs: "The client ID for OAuth authentication.",
                            isOptional,
                            typeReference: this.getAuthParameterTypeReference({
                                typeReference: STRING_TYPE_REFERENCE,
                                envVar: oauthConfig.clientIdEnvVar,
                                isOptional
                            }),
                            environmentVariable: oauthConfig.clientIdEnvVar
                        },
                        {
                            name: "clientSecret",
                            docs: "The client secret for OAuth authentication.",
                            isOptional,
                            typeReference: this.getAuthParameterTypeReference({
                                typeReference: STRING_TYPE_REFERENCE,
                                envVar: oauthConfig.clientSecretEnvVar,
                                isOptional
                            }),
                            environmentVariable: oauthConfig.clientSecretEnvVar
                        }
                    ];
                    for (const property of getOAuthTokenRequestProperties(
                        this.context,
                        oauthConfig.tokenEndpoint.requestProperties
                    )) {
                        params.push({
                            name: property.parameterName,
                            docs: "A property required by the OAuth token endpoint.",
                            isOptional,
                            typeReference: this.getAuthParameterTypeReference({
                                typeReference: property.valueType,
                                envVar: undefined,
                                isOptional
                            })
                        });
                    }
                    return params;
                }
                // Fallback to the default bearer token scheme for other OAuth types
                const name = "token";
                return [
                    {
                        name,
                        docs: this.getAuthParameterDocs({ docs: scheme.docs, name }),
                        isOptional,
                        header: BEARER_HEADER_INFO,
                        typeReference: STRING_TYPE_REFERENCE
                    }
                ];
            }
            case "inferred": {
                return this.getParametersForInferredAuth(scheme);
            }
            default:
                assertNever(scheme);
        }
    }

    private getParameterForHeader(header: FernIr.HttpHeader): ConstructorParameter {
        return {
            name: this.context.getParameterName(header.name),
            header: {
                name: getWireValue(header.name)
            },
            docs: header.docs,
            isOptional: this.context.isOptional(header.valueType),
            typeReference: header.valueType,
            environmentVariable: header.env,
            isGlobalHeader: true,
            clientDefault: header.clientDefault
        };
    }

    private getHeaderValue({
        prefix,
        parameterName
    }: {
        prefix: string | undefined;
        parameterName: string;
    }): php.CodeBlock {
        return php.codeblock(prefix != null ? `"${prefix} $${parameterName}"` : `$${parameterName}`);
    }

    private getAuthParameterTypeReference({
        typeReference,
        envVar,
        isOptional
    }: {
        typeReference: FernIr.TypeReference;
        envVar: string | undefined;
        isOptional: boolean;
    }): FernIr.TypeReference {
        // If the parameter is backed by an environment variable,
        // it should be treated as optional.
        return envVar != null || isOptional
            ? FernIr.TypeReference.container(FernIr.ContainerType.optional(typeReference))
            : typeReference;
    }

    private getLiteralRootClientParameterType({ literal }: { literal: FernIr.Literal }): php.Type {
        switch (literal.type) {
            case "string":
                return php.Type.optional(php.Type.string());
            case "boolean":
                return php.Type.optional(php.Type.bool());
            default:
                assertNever(literal);
        }
    }

    private getAuthParameterDocs({ docs, name }: { docs: string | undefined; name: string }): string {
        return docs ?? `The ${name} to use for authentication.`;
    }

    private getClientDefaultLiteralWireValue(literal: FernIr.Literal): string {
        switch (literal.type) {
            case "string":
                return literal.string;
            case "boolean":
                return literal.boolean ? "true" : "false";
            default:
                assertNever(literal);
        }
    }

    /**
     * Whether explicitly provided constructor auth credentials should take precedence
     * over environment-variable defaults when selecting the auth scheme. Opt-in via the
     * `preferExplicitAuth` config; only applies when OAuth client-credentials is
     * composed with a basic auth scheme via `auth: any` (outside endpoint-security).
     */
    private preferExplicitAuthEnabled(): boolean {
        if (this.context.customConfig.preferExplicitAuth !== true) {
            return false;
        }
        if (this.context.isEndpointSecurity()) {
            return false;
        }
        if (!this.isAnyAuthWithMultipleSchemes()) {
            return false;
        }
        const oauth = this.context.getOauth();
        if (oauth == null || oauth.configuration.type !== "clientCredentials" || !this.shouldUseOAuthProvider()) {
            return false;
        }
        return this.getBasicAuthCredentialParameterNames().length > 0;
    }

    /**
     * Returns the constructor parameter names for the basic auth credentials
     * (excluding omitted fields), e.g. `["username", "password"]`.
     */
    private getBasicAuthCredentialParameterNames(): string[] {
        const names: string[] = [];
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type !== "basic") {
                continue;
            }
            if (!scheme.usernameOmit) {
                names.push(this.context.getParameterName(scheme.username));
            }
            if (!scheme.passwordOmit) {
                names.push(this.context.getParameterName(scheme.password));
            }
        }
        return names;
    }

    /**
     * Resolves a basic auth scheme into its null-check condition and credential expressions,
     * accounting for omitted username/password fields. Returns undefined if both fields are omitted.
     */
    private resolveBasicAuthScheme(
        scheme: FernIr.AuthScheme & { type: "basic" }
    ): { condition: string; credentialExpr: string } | undefined {
        const usernameName = this.context.getParameterName(scheme.username);
        const passwordName = this.context.getParameterName(scheme.password);
        const usernameOmitted = !!scheme.usernameOmit;
        const passwordOmitted = !!scheme.passwordOmit;

        if (usernameOmitted && passwordOmitted) {
            return undefined;
        }

        // Only add null-check conditions for params without environment variable fallbacks.
        // Params with env vars are guaranteed non-null after the ??= getFromEnvOrThrow assignment.
        // Under `any`-composed multi-scheme auth env vars do NOT throw when unset, so the
        // credentials may be null even with an env var and must always be guarded.
        const anyAuthMultiScheme = this.isAnyAuthWithMultipleSchemes();
        const conditions: string[] = [];
        if (!usernameOmitted && (scheme.usernameEnvVar == null || anyAuthMultiScheme)) {
            conditions.push(`$${usernameName} !== null`);
        }
        if (!passwordOmitted && (scheme.passwordEnvVar == null || anyAuthMultiScheme)) {
            conditions.push(`$${passwordName} !== null`);
        }

        // Build a clean credential expression without redundant empty-string concatenation.
        let credentialExpr: string;
        if (usernameOmitted) {
            credentialExpr = `":" . $${passwordName}`;
        } else if (passwordOmitted) {
            credentialExpr = `$${usernameName} . ":"`;
        } else {
            credentialExpr = `$${usernameName} . ":" . $${passwordName}`;
        }

        return {
            condition: conditions.join(" && "),
            credentialExpr
        };
    }

    private getRootSubpackages(): FernIr.Subpackage[] {
        return this.context.ir.rootPackage.subpackages
            .map((subpackageId) => {
                return this.context.getSubpackageOrThrow(subpackageId);
            })
            .filter((subpackage) => this.context.shouldGenerateSubpackageClient(subpackage));
    }

    private writeOAuthProviderSetup(
        writer: php.Writer,
        oauth: FernIr.OAuthScheme,
        isMultiUrl: boolean,
        guarded = false,
        targetVar = "$this->oauthTokenProvider",
        authRawClientOptions = "['headers' => []]"
    ): void {
        const configuration = getClientCredentialsOrThrow(oauth);
        const tokenEndpointReference = configuration.tokenEndpoint.endpointReference;
        const subpackageId = tokenEndpointReference.subpackageId;

        let authClientClassReference: php.ClassReference;
        if (subpackageId != null) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            authClientClassReference = this.context.getSubpackageClassReference(subpackage);
        } else {
            authClientClassReference = php.classReference({
                name: this.context.getRootClientClassName(),
                namespace: this.context.getRootNamespace()
            });
        }

        const oauthTokenProviderClassReference = php.classReference({
            name: "OAuthTokenProvider",
            namespace: this.context.getCoreNamespace()
        });

        writer.write("$authRawClient = new ");
        writer.writeNode(this.context.rawClient.getClassReference());
        writer.writeLine(`(${authRawClientOptions});`);

        writer.write("$authClient = new ");
        writer.writeNode(authClientClassReference);
        if (isMultiUrl) {
            writer.writeLine("($authRawClient, $environment);");
        } else {
            writer.writeLine("($authRawClient);");
        }

        writer.write(`${targetVar} = new `);
        writer.writeNode(oauthTokenProviderClassReference);
        // When wrapped in a credential guard (any-composed auth), clientId/clientSecret
        // are non-null inside the block, so the `?? ''` fallback would be redundant.
        // Env-var-backed params are also non-null, but only when the OAuth scheme's own
        // constructor parameters were generated (they are skipped when a bearer scheme
        // exists) — the env-or-throw assignment is tied to those parameters.
        const oauthParamsSkipped = this.context.ir.auth.schemes.some((s) => s.type === "bearer");
        const clientIdFallback =
            guarded || (configuration.clientIdEnvVar != null && !oauthParamsSkipped) ? "$clientId" : "$clientId ?? ''";
        const clientSecretFallback =
            guarded || (configuration.clientSecretEnvVar != null && !oauthParamsSkipped)
                ? "$clientSecret"
                : "$clientSecret ?? ''";
        const isAuthMandatory = this.context.ir.sdkConfig.isAuthMandatory;
        const extraArgs = getOAuthTokenRequestProperties(
            this.context,
            configuration.tokenEndpoint.requestProperties
        ).map((property) => (isAuthMandatory ? `$${property.parameterName}` : `$${property.parameterName} ?? ''`));
        const args = [clientIdFallback, clientSecretFallback, ...extraArgs, "$authClient"].join(", ");
        writer.writeLine(`(${args});`);
        writer.writeLine();
    }

    private getParametersForInferredAuth(scheme: FernIr.InferredAuthScheme): ConstructorParameter[] {
        const isOptional =
            !this.context.ir.sdkConfig.isAuthMandatory ||
            this.isAnyAuthWithMultipleSchemes() ||
            this.context.isEndpointSecurity();
        const parameters: ConstructorParameter[] = [];

        // Get the token endpoint to extract request properties
        const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        if (service == null) {
            this.context.logger.warn(`Service with id ${tokenEndpointReference.serviceId} not found for inferred auth`);
            return [];
        }

        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        if (endpoint == null) {
            this.context.logger.warn(
                `Endpoint with id ${tokenEndpointReference.endpointId} not found for inferred auth`
            );
            return [];
        }

        // Extract parameters from the token endpoint request
        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest != null && sdkRequest.shape.type === "wrapper") {
            // Get the request body properties
            const requestBody = endpoint.requestBody;
            if (requestBody != null && requestBody.type === "inlinedRequestBody") {
                for (const property of requestBody.properties) {
                    const literal = this.context.maybeLiteral(property.valueType);
                    if (literal == null) {
                        // Only add non-literal properties as constructor parameters
                        parameters.push({
                            name: this.context.getParameterName(property.name),
                            docs: property.docs,
                            isOptional: isOptional || this.context.isOptional(property.valueType),
                            typeReference: this.getAuthParameterTypeReference({
                                typeReference: property.valueType,
                                envVar: undefined,
                                isOptional: isOptional || this.context.isOptional(property.valueType)
                            })
                        });
                    }
                }
            }

            // Also add header parameters from the endpoint
            for (const header of endpoint.headers) {
                const literal = this.context.maybeLiteral(header.valueType);
                if (literal == null) {
                    parameters.push({
                        name: this.context.getParameterName(header.name),
                        docs: header.docs,
                        isOptional: isOptional || this.context.isOptional(header.valueType),
                        header: {
                            name: getWireValue(header.name)
                        },
                        typeReference: this.getAuthParameterTypeReference({
                            typeReference: header.valueType,
                            envVar: undefined,
                            isOptional: isOptional || this.context.isOptional(header.valueType)
                        })
                    });
                }
            }
        }

        return parameters;
    }

    private writeInferredAuthProviderSetup(
        writer: php.Writer,
        inferredAuth: FernIr.InferredAuthScheme,
        isMultiUrl: boolean,
        constructorParameters: ConstructorParameters,
        guarded = false,
        targetVar = "$this->inferredAuthProvider",
        authRawClientOptions = "['headers' => []]"
    ): void {
        const tokenEndpointReference = inferredAuth.tokenEndpoint.endpoint;
        const subpackageId = tokenEndpointReference.subpackageId;

        let authClientClassReference: php.ClassReference;
        if (subpackageId != null) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            authClientClassReference = this.context.getSubpackageClassReference(subpackage);
        } else {
            authClientClassReference = php.classReference({
                name: this.context.getRootClientClassName(),
                namespace: this.context.getRootNamespace()
            });
        }

        const inferredAuthProviderClassReference = php.classReference({
            name: "InferredAuthProvider",
            namespace: this.context.getCoreNamespace()
        });

        writer.write("$authRawClient = new ");
        writer.writeNode(this.context.rawClient.getClassReference());
        writer.writeLine(`(${authRawClientOptions});`);

        writer.write("$authClient = new ");
        writer.writeNode(authClientClassReference);
        if (isMultiUrl) {
            writer.writeLine("($authRawClient, $environment);");
        } else {
            writer.writeLine("($authRawClient);");
        }

        // Build the options array for the InferredAuthProvider
        writer.writeLine("$inferredAuthOptions = [");
        writer.indent();

        // Get the token endpoint to extract request properties
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        if (service != null) {
            const endpoint = service.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
            if (endpoint != null) {
                const sdkRequest = endpoint.sdkRequest;
                if (sdkRequest != null && sdkRequest.shape.type === "wrapper") {
                    const requestBody = endpoint.requestBody;
                    if (requestBody != null && requestBody.type === "inlinedRequestBody") {
                        for (const property of requestBody.properties) {
                            const paramName = this.context.getParameterName(property.name);
                            const literal = this.context.maybeLiteral(property.valueType);
                            if (literal != null) {
                                writer.writeLine(`'${paramName}' => ${this.context.getLiteralAsString(literal)},`);
                            } else {
                                // Check if this parameter is required (not optional and not env variable)
                                const isOptionalParam = constructorParameters.optional.some(
                                    (p: ConstructorParameter) => p.name === paramName
                                );
                                if (isOptionalParam && !guarded) {
                                    writer.writeLine(`'${paramName}' => $${paramName} ?? '',`);
                                } else {
                                    writer.writeLine(`'${paramName}' => $${paramName},`);
                                }
                            }
                        }
                    }

                    // Also add header parameters
                    for (const header of endpoint.headers) {
                        const paramName = this.context.getParameterName(header.name);
                        const literal = this.context.maybeLiteral(header.valueType);
                        if (literal != null) {
                            writer.writeLine(`'${paramName}' => ${this.context.getLiteralAsString(literal)},`);
                        } else {
                            // Check if this parameter is required (not optional and not env variable)
                            const isOptionalParam = constructorParameters.optional.some(
                                (p: ConstructorParameter) => p.name === paramName
                            );
                            if (isOptionalParam && !guarded) {
                                writer.writeLine(`'${paramName}' => $${paramName} ?? '',`);
                            } else {
                                writer.writeLine(`'${paramName}' => $${paramName},`);
                            }
                        }
                    }
                }
            }
        }

        writer.dedent();
        writer.writeLine("];");

        writer.write(`${targetVar} = new `);
        writer.writeNode(inferredAuthProviderClassReference);
        writer.writeLine("($authClient, $inferredAuthOptions);");
        writer.writeLine();
    }

    private getInferredAuthTokenEndpoint(
        scheme: FernIr.InferredAuthScheme
    ): { service: FernIr.HttpService; endpoint: FernIr.HttpEndpoint } | undefined {
        const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        if (service == null) {
            return undefined;
        }
        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        if (endpoint == null) {
            return undefined;
        }
        return { service, endpoint };
    }

    /**
     * True when auth is `any`-composed across more than one scheme. In that case
     * each scheme's credentials are independently optional (the caller supplies
     * exactly one scheme's creds), so we must not throw for missing creds and must
     * only wire up a scheme's token provider / header when its creds are present.
     */
    /**
     * Both OAuth and inferred auth attach their auth headers through a token
     * provider, and only one provider can drive the root client's
     * `getAuthHeaders` callback. When both schemes are present (e.g. `auth: any`
     * with an OAuth and an inferred scheme), pick the provider-based scheme that
     * appears first in `ir.auth.schemes`, which mirrors the declared `any` order.
     */
    private shouldUseOAuthProvider(): boolean {
        const oauth = this.context.getOauth();
        if (oauth == null || oauth.configuration.type !== "clientCredentials") {
            return false;
        }
        if (this.context.getInferredAuth() == null) {
            return true;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            if (scheme.type === "oauth") {
                return true;
            }
            if (scheme.type === "inferred") {
                return false;
            }
        }
        return true;
    }

    private isAnyAuthWithMultipleSchemes(): boolean {
        return this.context.ir.auth.requirement === "ANY" && this.context.ir.auth.schemes.length > 1;
    }

    /**
     * Builds a PHP boolean expression that is true only when all of an inferred-auth
     * scheme's (non-literal) credential parameters were supplied. Returns null when
     * the scheme has no such parameters.
     */
    private getInferredAuthCredentialGuard(scheme: FernIr.InferredAuthScheme): string | null {
        const names = this.getParametersForInferredAuth(scheme).map((param) => param.name);
        if (names.length === 0) {
            return null;
        }
        return names.map((name) => `$${name} !== null`).join(" && ");
    }

    private newRootClientFile(class_: php.Class): PhpFile {
        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }
}
