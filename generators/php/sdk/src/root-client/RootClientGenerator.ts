import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { getOAuthTokenRequestProperties } from "../oauth/oauthTokenRequestProperties.js";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

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

        // Add field for OAuth token provider if using client credentials OAuth
        const oauth = this.context.getOauth();
        if (oauth != null && oauth.configuration.type === "clientCredentials" && this.shouldUseOAuthProvider()) {
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
        if (inferredAuth != null && !this.shouldUseOAuthProvider()) {
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
            constructorParameters.optional.some((parameter) => parameter.environmentVariable != null)
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

        parameters.push(
            php.parameter({
                name: this.context.getClientOptionsName(),
                type: php.Type.optional(this.context.getClientOptionsType()),
                initializer: php.codeblock("null")
            })
        );

        const headerEntries: php.Map.Entry[] = [];
        for (const param of constructorParameters.required) {
            if (param.header != null) {
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
            if (param.header != null && param.environmentVariable != null && !anyAuthMultiScheme) {
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
            if (this.context.version != null) {
                headerEntries.push({
                    key: php.codeblock(`'${platformHeaders.sdkVersion}'`),
                    value: php.codeblock(`'${this.context.version}'`)
                });
            }
            const userAgent = this.context.getUserAgent();
            if (userAgent != null) {
                headerEntries.push({
                    key: php.codeblock(`'${userAgent.header}'`),
                    value: this.context.customConfig.includePlatformHeaders
                        ? php.codeblock(
                              `self::${GET_PLATFORM_USER_AGENT}(strtolower(PHP_OS), php_uname('m'), PHP_VERSION)`
                          )
                        : php.codeblock(`'${userAgent.value}'`)
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
                for (const param of constructorParameters.optional) {
                    if (param.environmentVariable != null) {
                        if (param.clientDefault != null) {
                            const defaultWire = this.getClientDefaultLiteralWireValue(param.clientDefault);
                            const escaped = defaultWire.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                            writer.writeLine(`$envValue = getenv('${param.environmentVariable}');`);
                            writer.writeTextStatement(
                                `$${param.name} ??= ($envValue !== false ? $envValue : '${escaped}')`
                            );
                        } else if (anyAuthMultiScheme) {
                            // Fall back to the env var if present, but do not throw when it is
                            // missing — the caller may be authenticating with another scheme.
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
                    if (param.header != null && (param.environmentVariable == null || anyAuthMultiScheme)) {
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
                if (resolvedBasicAuthSchemes.length > 0) {
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
                const oauthCredGuard = "$clientId !== null && $clientSecret !== null";
                const inferredCredGuard =
                    inferredAuth != null ? this.getInferredAuthCredentialGuard(inferredAuth) : null;

                if (hasOAuth && oauth != null) {
                    if (anyAuthMultiScheme) {
                        writer.controlFlow("if", php.codeblock(oauthCredGuard));
                    }
                    this.writeOAuthProviderSetup(writer, oauth, isMultiUrl, anyAuthMultiScheme);
                    if (anyAuthMultiScheme) {
                        writer.endControlFlow();
                    }
                }

                if (hasInferredAuth && inferredAuth != null) {
                    const guardInferred = anyAuthMultiScheme && inferredCredGuard != null;
                    if (guardInferred) {
                        writer.controlFlow("if", php.codeblock(inferredCredGuard));
                    }
                    this.writeInferredAuthProviderSetup(
                        writer,
                        inferredAuth,
                        isMultiUrl,
                        constructorParameters,
                        guardInferred
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

                // Build the RawClient options, including getAuthHeaders callback if using OAuth or InferredAuth
                if (hasOAuth || hasInferredAuth) {
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

        for (const param of allParameters) {
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
            all: allParameters,
            required: requiredParameters,
            optional: optionalParameters,
            literal: literalParameters
        };
    }

    private getParameterForAuthScheme(scheme: FernIr.AuthScheme): ConstructorParameter[] {
        const isOptional = !this.context.ir.sdkConfig.isAuthMandatory || this.isAnyAuthWithMultipleSchemes();
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
        guarded = false
    ): void {
        const tokenEndpointReference = oauth.configuration.tokenEndpoint.endpointReference;
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
        writer.writeLine("(['headers' => []]);");

        writer.write("$authClient = new ");
        writer.writeNode(authClientClassReference);
        if (isMultiUrl) {
            writer.writeLine("($authRawClient, $environment);");
        } else {
            writer.writeLine("($authRawClient);");
        }

        writer.write("$this->oauthTokenProvider = new ");
        writer.writeNode(oauthTokenProviderClassReference);
        // When wrapped in a credential guard (any-composed auth), clientId/clientSecret
        // are non-null inside the block, so the `?? ''` fallback would be redundant.
        const clientIdFallback =
            guarded || oauth.configuration.clientIdEnvVar != null ? "$clientId" : "$clientId ?? ''";
        const clientSecretFallback =
            guarded || oauth.configuration.clientSecretEnvVar != null ? "$clientSecret" : "$clientSecret ?? ''";
        const isAuthMandatory = this.context.ir.sdkConfig.isAuthMandatory;
        const extraArgs = getOAuthTokenRequestProperties(
            this.context,
            oauth.configuration.tokenEndpoint.requestProperties
        ).map((property) => (isAuthMandatory ? `$${property.parameterName}` : `$${property.parameterName} ?? ''`));
        const args = [clientIdFallback, clientSecretFallback, ...extraArgs, "$authClient"].join(", ");
        writer.writeLine(`(${args});`);
        writer.writeLine();
    }

    private getParametersForInferredAuth(scheme: FernIr.InferredAuthScheme): ConstructorParameter[] {
        const isOptional = !this.context.ir.sdkConfig.isAuthMandatory || this.isAnyAuthWithMultipleSchemes();
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
        guarded = false
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
        writer.writeLine("(['headers' => []]);");

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

        writer.write("$this->inferredAuthProvider = new ");
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
