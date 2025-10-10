import { assertNever, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { Package } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace RootClientGenerator {
    interface Args {
        clientName: string;
        symbolId: string;
        package_: Package;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

type BearerTokenParamType = "string" | "async-provider";

export class RootClientGenerator {
    private readonly clientName: string;
    private readonly symbolId: string;
    private readonly package_: Package;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    public constructor({ clientName, symbolId, package_, sdkGeneratorContext }: RootClientGenerator.Args) {
        this.clientName = clientName;
        this.symbolId = symbolId;
        this.package_ = package_;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.clientGeneratorContext = new ClientGeneratorContext({
            packageOrSubpackage: package_,
            sdkGeneratorContext
        });
    }

    private get service() {
        return this.package_.service != null
            ? this.sdkGeneratorContext.getHttpServiceOrThrow(this.package_.service)
            : undefined;
    }

    private get baseUrlParam() {
        return swift.functionParameter({
            argumentLabel: "baseURL",
            unsafeName: "baseURL",
            type: swift.TypeReference.type(swift.Type.string()),
            defaultValue: this.getDefaultBaseUrl(),
            docsContent:
                "The base URL to use for requests from the client. If not provided, the default base URL will be used."
        });
    }

    private get headersParam() {
        return swift.functionParameter({
            argumentLabel: "headers",
            unsafeName: "headers",
            type: swift.TypeReference.type(
                swift.Type.optional(swift.Type.dictionary(swift.Type.string(), swift.Type.string()))
            ),
            defaultValue: swift.Expression.nil(),
            docsContent: "Additional headers to send with each request."
        });
    }

    private get timeoutParam() {
        return swift.functionParameter({
            argumentLabel: "timeout",
            unsafeName: "timeout",
            type: swift.TypeReference.type(swift.Type.optional(swift.Type.int())),
            defaultValue: swift.Expression.rawValue("nil"),
            docsContent:
                "Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided."
        });
    }

    private get maxRetriesParam() {
        return swift.functionParameter({
            argumentLabel: "maxRetries",
            unsafeName: "maxRetries",
            type: swift.TypeReference.type(swift.Type.optional(swift.Type.int())),
            defaultValue: swift.Expression.rawValue("nil"),
            docsContent: "Maximum number of retries for failed requests. Defaults to 2."
        });
    }

    private get urlSessionParam() {
        return swift.functionParameter({
            argumentLabel: "urlSession",
            unsafeName: "urlSession",
            type: swift.TypeReference.type(swift.Type.optional(swift.Type.custom("URLSession"))),
            defaultValue: swift.Expression.rawValue("nil"),
            docsContent:
                "Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout."
        });
    }

    public generate() {
        return swift.class_({
            name: this.clientName,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: [
                ...this.clientGeneratorContext.subClients.map(({ property }) => property),
                this.clientGeneratorContext.httpClient.property
            ],
            initializers: this.generateInitializers(),
            methods: this.generateMethods(),
            docs: swift.docComment({
                summary:
                    "Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions."
            })
        });
    }

    private generateInitializers(): swift.Initializer[] {
        const initializers: swift.Initializer[] = [
            this.generateConvenienceInitializer({ bearerTokenParamType: "string" })
        ];
        const authSchemes = this.getAuthSchemeParameters();
        if (authSchemes.bearer) {
            // For `bearer` auth scheme, we have one more convenience initializer for the async token provider
            initializers.push(
                this.generateConvenienceInitializer({
                    bearerTokenParamType: "async-provider"
                })
            );
        }
        initializers.push(this.generateDesignatedInitializer());
        return initializers;
    }

    private generateConvenienceInitializer({ bearerTokenParamType }: { bearerTokenParamType: BearerTokenParamType }) {
        const authSchemes = this.getAuthSchemeParameters();
        const initializerParams = this.getConvenienceInitializerParams({
            bearerTokenParamType
        });

        const designatedInitializerArgs: swift.FunctionArgument[] = [
            swift.functionArgument({
                label: "baseURL",
                value: swift.Expression.reference("baseURL")
            }),
            swift.functionArgument({
                label: "headerAuth",
                value: authSchemes.header
                    ? authSchemes.header.param.type.isOptional
                        ? swift.Expression.methodCallWithTrailingClosure({
                              target: swift.Expression.reference(authSchemes.header.param.unsafeName),
                              methodName: "map",
                              closureBody: swift.Expression.contextualMethodCall({
                                  methodName: "init",
                                  arguments_: [
                                      swift.functionArgument({
                                          label: "key",
                                          value: swift.Expression.rawValue("$0")
                                      }),
                                      swift.functionArgument({
                                          label: "header",
                                          value: swift.Expression.stringLiteral(authSchemes.header.wireValue)
                                      })
                                  ]
                              }),
                              multiline: true
                          })
                        : swift.Expression.contextualMethodCall({
                              methodName: "init",
                              arguments_: [
                                  swift.functionArgument({
                                      label: "key",
                                      value: swift.Expression.reference(authSchemes.header.param.unsafeName)
                                  }),
                                  swift.functionArgument({
                                      label: "header",
                                      value: swift.Expression.stringLiteral(authSchemes.header.wireValue)
                                  })
                              ],
                              multiline: true
                          })
                    : swift.Expression.nil()
            }),
            swift.functionArgument({
                label: "bearerAuth",
                value: authSchemes.bearer
                    ? authSchemes.bearer.stringParam.type.isOptional
                        ? swift.Expression.methodCallWithTrailingClosure({
                              target: swift.Expression.reference(authSchemes.bearer.stringParam.unsafeName),
                              methodName: "map",
                              closureBody: swift.Expression.contextualMethodCall({
                                  methodName: "init",
                                  arguments_: [
                                      swift.functionArgument({
                                          label: "token",
                                          value: swift.Expression.contextualMethodCall({
                                              methodName: visitDiscriminatedUnion(
                                                  { bearerTokenParamType },
                                                  "bearerTokenParamType"
                                              )._visit({
                                                  string: () => "staticToken",
                                                  "async-provider": () => "provider"
                                              }),
                                              arguments_: [
                                                  swift.functionArgument({
                                                      value: swift.Expression.rawValue("$0")
                                                  })
                                              ]
                                          })
                                      })
                                  ]
                              }),
                              multiline: true
                          })
                        : swift.Expression.contextualMethodCall({
                              methodName: "init",
                              arguments_: [
                                  swift.functionArgument({
                                      label: "token",
                                      value: swift.Expression.contextualMethodCall({
                                          methodName: visitDiscriminatedUnion(
                                              { bearerTokenParamType },
                                              "bearerTokenParamType"
                                          )._visit({
                                              string: () => "staticToken",
                                              "async-provider": () => "provider"
                                          }),
                                          arguments_: [
                                              swift.functionArgument({
                                                  value: swift.Expression.reference(
                                                      authSchemes.bearer.stringParam.unsafeName
                                                  )
                                              })
                                          ]
                                      })
                                  })
                              ]
                          })
                    : swift.Expression.nil()
            }),
            swift.functionArgument({
                label: "basicAuth",
                value: authSchemes.basic
                    ? swift.Expression.contextualMethodCall({
                          methodName: "init",
                          arguments_: [
                              swift.functionArgument({
                                  label: "username",
                                  value: swift.Expression.reference(authSchemes.basic.usernameParam.unsafeName)
                              }),
                              swift.functionArgument({
                                  label: "password",
                                  value: swift.Expression.reference(authSchemes.basic.passwordParam.unsafeName)
                              })
                          ]
                      })
                    : swift.Expression.nil()
            }),
            swift.functionArgument({
                label: "headers",
                value: swift.Expression.reference("headers")
            }),
            swift.functionArgument({
                label: "timeout",
                value: swift.Expression.reference("timeout")
            }),
            swift.functionArgument({
                label: "maxRetries",
                value: swift.Expression.reference("maxRetries")
            }),
            swift.functionArgument({
                label: "urlSession",
                value: swift.Expression.reference("urlSession")
            })
        ];

        const getDocsSummary = () => {
            if (!authSchemes.bearer) {
                return "Initialize the client with the specified configuration.";
            }
            switch (bearerTokenParamType) {
                case "string":
                    return "Initialize the client with the specified configuration and a static bearer token.";
                case "async-provider":
                    return "Initialize the client with the specified configuration and an async bearer token provider.";
                default:
                    assertNever(bearerTokenParamType);
            }
        };

        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            convenience: true,
            parameters: initializerParams,
            body: swift.CodeBlock.withStatements([
                swift.Statement.expressionStatement(
                    swift.Expression.methodCall({
                        target: swift.Expression.self(),
                        methodName: "init",
                        arguments_: designatedInitializerArgs,
                        multiline: true
                    })
                )
            ]),
            multiline: true,
            docs: swift.docComment({
                summary: getDocsSummary(),
                parameters: initializerParams
                    .map((p) => ({
                        name: p.unsafeName,
                        description: p.docsContent ?? ""
                    }))
                    .filter((p) => p.description !== "")
            })
        });
    }

    private getConvenienceInitializerParams({
        bearerTokenParamType
    }: {
        bearerTokenParamType: BearerTokenParamType;
    }): swift.FunctionParameter[] {
        const params: swift.FunctionParameter[] = [this.baseUrlParam];
        const authSchemes = this.getAuthSchemeParameters();
        if (authSchemes.header) {
            params.push(authSchemes.header.param);
        }
        if (authSchemes.bearer) {
            if (bearerTokenParamType === "string") {
                params.push(authSchemes.bearer.stringParam);
            } else if (bearerTokenParamType === "async-provider") {
                params.push(authSchemes.bearer.asyncProviderParam);
            } else {
                assertNever(bearerTokenParamType);
            }
        }
        if (authSchemes.basic) {
            params.push(authSchemes.basic.usernameParam);
            params.push(authSchemes.basic.passwordParam);
        }
        params.push(this.headersParam, this.timeoutParam, this.maxRetriesParam, this.urlSessionParam);
        return params;
    }

    private generateDesignatedInitializer(): swift.Initializer {
        const initializerParams: swift.FunctionParameter[] = [
            swift.functionParameter({
                argumentLabel: "baseURL",
                unsafeName: "baseURL",
                type: swift.TypeReference.type(swift.Type.string())
            }),
            swift.functionParameter({
                argumentLabel: "headerAuth",
                unsafeName: "headerAuth",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.custom("ClientConfig.HeaderAuth"))),
                defaultValue: swift.Expression.nil()
            }),
            swift.functionParameter({
                argumentLabel: "bearerAuth",
                unsafeName: "bearerAuth",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.custom("ClientConfig.BearerAuth"))),
                defaultValue: swift.Expression.nil()
            }),
            swift.functionParameter({
                argumentLabel: "basicAuth",
                unsafeName: "basicAuth",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.custom("ClientConfig.BasicAuth"))),
                defaultValue: swift.Expression.nil()
            }),
            swift.functionParameter({
                argumentLabel: "headers",
                unsafeName: "headers",
                type: swift.TypeReference.type(
                    swift.Type.optional(swift.Type.dictionary(swift.Type.string(), swift.Type.string()))
                ),
                defaultValue: swift.Expression.nil()
            }),
            swift.functionParameter({
                argumentLabel: "timeout",
                unsafeName: "timeout",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.int())),
                defaultValue: swift.Expression.nil()
            }),
            swift.functionParameter({
                argumentLabel: "maxRetries",
                unsafeName: "maxRetries",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.int())),
                defaultValue: swift.Expression.nil()
            }),
            swift.functionParameter({
                argumentLabel: "urlSession",
                unsafeName: "urlSession",
                type: swift.TypeReference.type(swift.Type.optional(swift.Type.custom("URLSession"))),
                defaultValue: swift.Expression.nil()
            })
        ];

        return swift.initializer({
            parameters: initializerParams,
            body: swift.CodeBlock.withStatements([
                swift.Statement.constantDeclaration({
                    unsafeName: "config",
                    value: swift.Expression.classInitialization({
                        unsafeName: "ClientConfig",
                        arguments_: [
                            ...initializerParams.map((p) =>
                                swift.functionArgument({
                                    label: p.unsafeName,
                                    value: swift.Expression.reference(p.unsafeName)
                                })
                            )
                        ],
                        multiline: true
                    })
                }),
                ...this.clientGeneratorContext.subClients.map(({ property, clientName }) =>
                    swift.Statement.propertyAssignment(
                        property.unsafeName,
                        swift.Expression.classInitialization({
                            unsafeName: clientName,
                            arguments_: [
                                swift.functionArgument({
                                    label: "config",
                                    value: swift.Expression.reference("config")
                                })
                            ]
                        })
                    )
                ),
                swift.Statement.propertyAssignment(
                    this.clientGeneratorContext.httpClient.property.unsafeName,
                    swift.Expression.classInitialization({
                        unsafeName: this.clientGeneratorContext.httpClient.clientName,
                        arguments_: [
                            swift.functionArgument({
                                label: "config",
                                value: swift.Expression.reference("config")
                            })
                        ]
                    })
                )
            ]),
            multiline: true
        });
    }

    private getDefaultBaseUrl() {
        if (this.sdkGeneratorContext.ir.environments == null) {
            return undefined;
        }

        if (this.sdkGeneratorContext.ir.environments.environments.type === "singleBaseUrl") {
            const defaultEnvId = this.sdkGeneratorContext.ir.environments.defaultEnvironment;

            // If no default environment is specified, use the first environment
            const defaultEnvironment = this.sdkGeneratorContext.ir.environments.environments.environments.find(
                (e, idx) => (defaultEnvId == null ? idx === 0 : e.id === defaultEnvId)
            );
            if (defaultEnvironment != null) {
                const environmentSymbol =
                    this.sdkGeneratorContext.project.srcNameRegistry.getEnvironmentSymbolOrThrow();
                const environmentRef = this.sdkGeneratorContext.project.srcNameRegistry.reference({
                    fromSymbol: this.symbolId,
                    toSymbol: environmentSymbol
                });
                return swift.Expression.memberAccess({
                    target: swift.Expression.reference(environmentRef),
                    memberName: `${defaultEnvironment.name.camelCase.unsafeName}.rawValue`
                });
            }
            return undefined;
        } else if (this.sdkGeneratorContext.ir.environments.environments.type === "multipleBaseUrls") {
            // TODO(kafkas): Handle multiple environments
            return undefined;
        } else {
            assertNever(this.sdkGeneratorContext.ir.environments.environments);
        }
    }

    private getAuthSchemeParameters() {
        type ParamsByScheme = {
            header?: {
                param: swift.FunctionParameter;
                wireValue: string;
            };
            bearer?: {
                stringParam: swift.FunctionParameter;
                asyncProviderParam: swift.FunctionParameter;
            };
            basic?: {
                usernameParam: swift.FunctionParameter;
                passwordParam: swift.FunctionParameter;
            };
        };

        const paramsByScheme: ParamsByScheme = {};

        const { ir } = this.sdkGeneratorContext;
        const { isAuthMandatory } = ir.sdkConfig;
        const { schemes: authSchemes } = ir.auth;

        for (const scheme of authSchemes) {
            if (scheme.type === "header") {
                paramsByScheme.header = {
                    param: swift.functionParameter({
                        argumentLabel: scheme.name.name.camelCase.unsafeName,
                        unsafeName: scheme.name.name.camelCase.unsafeName,
                        type: isAuthMandatory
                            ? swift.TypeReference.type(swift.Type.string())
                            : swift.TypeReference.type(swift.Type.optional(swift.Type.string())),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: scheme.docs ?? `The API key to use for authentication.`
                    }),
                    wireValue: scheme.name.wireValue
                };
            } else if (scheme.type === "bearer") {
                paramsByScheme.bearer = {
                    stringParam: swift.functionParameter({
                        argumentLabel: scheme.token.camelCase.unsafeName,
                        unsafeName: scheme.token.camelCase.unsafeName,
                        type: isAuthMandatory
                            ? swift.TypeReference.type(swift.Type.string())
                            : swift.TypeReference.type(swift.Type.optional(swift.Type.string())),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent:
                            scheme.docs ??
                            `Bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.`
                    }),
                    asyncProviderParam: swift.functionParameter({
                        argumentLabel: scheme.token.camelCase.unsafeName,
                        unsafeName: scheme.token.camelCase.unsafeName,
                        escaping: isAuthMandatory ? true : undefined,
                        type: isAuthMandatory
                            ? swift.TypeReference.type(swift.Type.custom("ClientConfig.CredentialProvider"))
                            : swift.TypeReference.type(
                                  swift.Type.optional(swift.Type.custom("ClientConfig.CredentialProvider"))
                              ),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: `An async function that returns the bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.`
                    })
                };
            } else if (scheme.type === "basic") {
                paramsByScheme.basic = {
                    usernameParam: swift.functionParameter({
                        argumentLabel: scheme.username.camelCase.unsafeName,
                        unsafeName: scheme.username.camelCase.unsafeName,
                        type: isAuthMandatory
                            ? swift.TypeReference.type(swift.Type.string())
                            : swift.TypeReference.type(swift.Type.optional(swift.Type.string())),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: `The username to use for authentication.`
                    }),
                    passwordParam: swift.functionParameter({
                        argumentLabel: scheme.password.camelCase.unsafeName,
                        unsafeName: scheme.password.camelCase.unsafeName,
                        type: isAuthMandatory
                            ? swift.TypeReference.type(swift.Type.string())
                            : swift.TypeReference.type(swift.Type.optional(swift.Type.string())),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: `The password to use for authentication.`
                    })
                };
            } else if (scheme.type === "oauth") {
                // TODO(kafkas): Implement oauth auth scheme
            } else if (scheme.type === "inferred") {
                // TODO(kafkas): Implement inferred auth scheme
            } else {
                assertNever(scheme);
            }
        }

        return paramsByScheme;
    }

    private generateMethods(): swift.Method[] {
        const endpointMethodGenerator = new EndpointMethodGenerator({
            parentClassSymbolId: this.symbolId,
            clientGeneratorContext: this.clientGeneratorContext,
            sdkGeneratorContext: this.sdkGeneratorContext
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }
}
