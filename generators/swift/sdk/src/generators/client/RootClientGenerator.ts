import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { Package } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace RootClientGenerator {
    interface Args {
        clientName: string;
        package_: Package;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class RootClientGenerator {
    private readonly clientName: string;
    private readonly package_: Package;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    public constructor({ clientName, package_, sdkGeneratorContext }: RootClientGenerator.Args) {
        this.clientName = clientName;
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

    public generate(): swift.Class {
        return swift.class_({
            name: this.clientName,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: [
                ...this.clientGeneratorContext.subClients.map(({ property }) => property),
                this.clientGeneratorContext.httpClient.property
            ],
            initializers: [this.generateDesignatedInitializer()],
            methods: this.generateMethods(),
            docs: swift.docComment({
                summary:
                    "Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions."
            })
        });
    }

    private generateDesignatedInitializer(): swift.Initializer {
        const initializerParams = this.getDesignatedInitializerParams();
        const authSchemes = this.getAuthSchemeParameters();

        const clientConfigArgs: swift.FunctionArgument[] = [
            swift.functionArgument({
                label: "baseURL",
                value: swift.Expression.reference("baseURL")
            })
        ];

        if (authSchemes.header) {
            clientConfigArgs.push(
                swift.functionArgument({
                    label: "headerAuth",
                    value: swift.Expression.contextualMethodCall({
                        methodName: "init",
                        arguments_: [
                            swift.functionArgument({
                                label: "key",
                                value: swift.Expression.reference(authSchemes.header.param.unsafeName)
                            }),
                            swift.functionArgument({
                                label: "header",
                                value: swift.Expression.rawStringValue(authSchemes.header.wireValue)
                            })
                        ],
                        multiline: true
                    })
                })
            );
        }

        if (authSchemes.bearer) {
            clientConfigArgs.push(
                swift.functionArgument({
                    label: "bearerAuth",
                    // TODO(kafkas): No .map when it's not optional
                    value: swift.Expression.methodCallWithTrailingClosure({
                        target: swift.Expression.reference(authSchemes.bearer.param.unsafeName),
                        methodName: "map",
                        closureBody: swift.Expression.contextualMethodCall({
                            methodName: "init",
                            arguments_: [
                                swift.functionArgument({
                                    label: "token",
                                    value: swift.Expression.rawValue("$0")
                                })
                            ]
                        })
                    })
                })
            );
        }

        if (authSchemes.basic) {
            clientConfigArgs.push(
                swift.functionArgument({
                    label: "basicAuth",
                    value: swift.Expression.contextualMethodCall({
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
                })
            );
        }

        clientConfigArgs.push(
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
        );

        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: initializerParams,
            body: swift.CodeBlock.withStatements([
                swift.Statement.constantDeclaration({
                    unsafeName: "config",
                    value: swift.Expression.classInitialization({
                        unsafeName: "ClientConfig",
                        arguments_: clientConfigArgs,
                        multiline: true
                    })
                }),
                ...this.clientGeneratorContext.subClients.map(({ property, clientName }) =>
                    swift.Statement.propertyAssignment(
                        property.unsafeName,
                        swift.Expression.classInitialization({
                            unsafeName: clientName,
                            arguments_: [
                                swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                            ]
                        })
                    )
                ),
                swift.Statement.propertyAssignment(
                    this.clientGeneratorContext.httpClient.property.unsafeName,
                    swift.Expression.classInitialization({
                        unsafeName: this.clientGeneratorContext.httpClient.clientName,
                        arguments_: [
                            swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                        ]
                    })
                )
            ]),
            multiline: true,
            docs: swift.docComment({
                summary: "Initialize the client with the specified configuration.",
                parameters: initializerParams
                    .map((p) => ({
                        name: p.unsafeName,
                        description: p.docsContent ?? ""
                    }))
                    .filter((p) => p.description !== "")
            })
        });
    }

    private getDesignatedInitializerParams(): swift.FunctionParameter[] {
        const params: swift.FunctionParameter[] = [
            swift.functionParameter({
                argumentLabel: "baseURL",
                unsafeName: "baseURL",
                type: swift.Type.string(),
                defaultValue: this.getDefaultBaseUrl(),
                docsContent:
                    "The base URL to use for requests from the client. If not provided, the default base URL will be used."
            })
        ];

        const authSchemes = this.getAuthSchemeParameters();

        if (authSchemes.header) {
            params.push(authSchemes.header.param);
        }

        if (authSchemes.bearer) {
            params.push(authSchemes.bearer.param);
        }

        if (authSchemes.basic) {
            params.push(authSchemes.basic.usernameParam);
            params.push(authSchemes.basic.passwordParam);
        }

        params.push(
            swift.functionParameter({
                argumentLabel: "headers",
                unsafeName: "headers",
                type: swift.Type.optional(swift.Type.dictionary(swift.Type.string(), swift.Type.string())),
                defaultValue: swift.Expression.dictionaryLiteral({ entries: [] }),
                docsContent: "Additional headers to send with each request."
            }),
            swift.functionParameter({
                argumentLabel: "timeout",
                unsafeName: "timeout",
                type: swift.Type.optional(swift.Type.int()),
                defaultValue: swift.Expression.rawValue("nil"),
                docsContent:
                    "Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided."
            }),
            swift.functionParameter({
                argumentLabel: "maxRetries",
                unsafeName: "maxRetries",
                type: swift.Type.optional(swift.Type.int()),
                defaultValue: swift.Expression.rawValue("nil"),
                docsContent: "Maximum number of retries for failed requests. Defaults to 2."
            }),
            swift.functionParameter({
                argumentLabel: "urlSession",
                unsafeName: "urlSession",
                type: swift.Type.optional(swift.Type.custom("URLSession")),
                defaultValue: swift.Expression.rawValue("nil"),
                docsContent:
                    "Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout."
            })
        );

        return params;
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
                return swift.Expression.memberAccess({
                    target: swift.Expression.reference(
                        this.sdkGeneratorContext.project.symbolRegistry.getEnvironmentSymbolOrThrow()
                    ),
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
                param: swift.FunctionParameter;
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
                        type: isAuthMandatory ? swift.Type.string() : swift.Type.optional(swift.Type.string()),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: scheme.docs ?? `The API key to use for authentication.`
                    }),
                    wireValue: scheme.name.wireValue
                };
            } else if (scheme.type === "bearer") {
                paramsByScheme.bearer = {
                    param: swift.functionParameter({
                        argumentLabel: scheme.token.camelCase.unsafeName,
                        unsafeName: scheme.token.camelCase.unsafeName,
                        type: isAuthMandatory ? swift.Type.string() : swift.Type.optional(swift.Type.string()),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent:
                            scheme.docs ??
                            `Bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.`
                    })
                };
            } else if (scheme.type === "basic") {
                paramsByScheme.basic = {
                    usernameParam: swift.functionParameter({
                        argumentLabel: scheme.username.camelCase.unsafeName,
                        unsafeName: scheme.username.camelCase.unsafeName,
                        type: isAuthMandatory ? swift.Type.string() : swift.Type.optional(swift.Type.string()),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: `The username to use for authentication.`
                    }),
                    passwordParam: swift.functionParameter({
                        argumentLabel: scheme.password.camelCase.unsafeName,
                        unsafeName: scheme.password.camelCase.unsafeName,
                        type: isAuthMandatory ? swift.Type.string() : swift.Type.optional(swift.Type.string()),
                        defaultValue: isAuthMandatory ? undefined : swift.Expression.nil(),
                        docsContent: `The password to use for authentication.`
                    })
                };
            } else if (scheme.type === "oauth") {
                // TODO(kafkas): Implement this
            } else {
                assertNever(scheme);
            }
        }

        return paramsByScheme;
    }

    private generateMethods(): swift.Method[] {
        const endpointMethodGenerator = new EndpointMethodGenerator({
            clientGeneratorContext: this.clientGeneratorContext,
            sdkGeneratorContext: this.sdkGeneratorContext
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }
}
