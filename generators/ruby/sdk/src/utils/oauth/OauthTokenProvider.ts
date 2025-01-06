import {
    Argument,
    AstNode,
    ClassReference,
    Class_,
    ConditionalStatement,
    Expression,
    FunctionInvocation,
    Function_,
    Import,
    Parameter,
    Property,
    StringClassReference
} from "@fern-api/ruby-codegen";

import { OAuthAccessTokenProperties, ResponseProperty } from "@fern-fern/ir-sdk/api";

export interface OauthFunction {
    tokenResponseProperty: OAuthAccessTokenProperties;
    tokenFunctionClientClassReference: ClassReference;
    tokenFunction: Function_;
}

export declare namespace OauthTokenProvider {
    export interface ClientCredentialsInit {
        accessTokenFunction: OauthFunction;
        refreshTokenFunction?: OauthFunction;
    }

    export interface Init {
        clientName: string;
        oauthConfiguration: ClientCredentialsInit;
        oauthType: OauthType;
        requestClientReference: ClassReference;
        accessTokenReference: ClassReference;
    }
}

type OauthType = "client_credentials" | undefined;

export class OauthTokenProvider extends Class_ {
    public fetchToken: Function_;
    public initializerParameters: Parameter[];
    public static FIELD_NAME = "token";

    // Including the type here to try to future proof some, though it's a bit awkward
    constructor({
        clientName,
        oauthConfiguration,
        oauthType,
        requestClientReference,
        accessTokenReference
    }: OauthTokenProvider.Init) {
        const tokenProviderClassReference = new ClassReference({
            name: "OauthTokenProvider",
            import_: new Import({ from: "core/oauth", isExternal: false }),
            moduleBreadcrumbs: [clientName]
        });
        super({
            classReference: tokenProviderClassReference,
            includeInitializer: false,
            documentation: "Utility class for managing token refresh.",
            initializerOverride: OauthTokenProvider.getInitializer(
                oauthType,
                oauthConfiguration,
                requestClientReference,
                tokenProviderClassReference
            ),
            properties: OauthTokenProvider.getProperties(oauthType, oauthConfiguration),
            functions: [
                OauthTokenProvider.getTokenFunction(oauthType),
                ...OauthTokenProvider.getAdditionalFunctions(oauthType, accessTokenReference, oauthConfiguration)
            ],
            expressions: OauthTokenProvider.getExpressions(oauthType)
        });

        // Expose the function for fetching the access token since that's what's
        // being used by the different functions consuming this.
        this.fetchToken = OauthTokenProvider.getTokenFunction(oauthType);
        this.initializerParameters = OauthTokenProvider.getParameters(oauthType, requestClientReference);
    }

    private static getInitializer(
        oauthType: OauthType,
        oauthConfiguration: OauthTokenProvider.ClientCredentialsInit,
        requestClient: ClassReference,
        tokenProvider: ClassReference
    ): Function_ {
        switch (oauthType) {
            case "client_credentials": {
                const body = [
                    new Expression({
                        leftSide: "@client_id",
                        rightSide: "client_id",
                        isAssignment: true
                    }),
                    new Expression({
                        leftSide: "@client_secret",
                        rightSide: "client_secret",
                        isAssignment: true
                    })
                ];
                body.push(
                    new Expression({
                        leftSide: "@auth_client",
                        rightSide: new FunctionInvocation({
                            onObject: oauthConfiguration.accessTokenFunction.tokenFunctionClientClassReference,
                            baseFunction: new Function_({ name: "new", functionBody: [] }),
                            arguments_: [
                                new Argument({ value: "request_client", name: "request_client", isNamed: true })
                            ]
                        }),
                        isAssignment: true
                    })
                );
                if (OauthTokenProvider.isRefreshClientSeperate(oauthConfiguration)) {
                    body.push(
                        new Expression({
                            leftSide: "@refresh_client",
                            rightSide: new FunctionInvocation({
                                onObject: oauthConfiguration.refreshTokenFunction?.tokenFunctionClientClassReference,
                                baseFunction: new Function_({ name: "new", functionBody: [] }),
                                arguments_: [
                                    new Argument({ value: "request_client", name: "request_client", isNamed: true })
                                ]
                            }),
                            isAssignment: true
                        })
                    );
                }

                return new Function_({
                    name: "initialize",
                    invocationName: "new",
                    functionBody: body,
                    parameters: OauthTokenProvider.getParameters(oauthType, requestClient),
                    returnValue: tokenProvider
                });
            }
            default:
                throw new Error("Invalid oauth type");
        }
    }

    private static getParameters(oauthType: OauthType, requestClient: ClassReference): Parameter[] {
        switch (oauthType) {
            case "client_credentials": {
                return [
                    new Parameter({
                        name: "client_id",
                        type: StringClassReference
                    }),
                    new Parameter({
                        name: "client_secret",
                        type: StringClassReference
                    }),
                    new Parameter({
                        name: "request_client",
                        type: requestClient
                    })
                ];
            }
            default:
                return [];
        }
    }

    private static isRefreshClientSeperate(oauthConfiguration: OauthTokenProvider.ClientCredentialsInit): boolean {
        return (
            oauthConfiguration.refreshTokenFunction != null &&
            oauthConfiguration.refreshTokenFunction.tokenFunctionClientClassReference !==
                oauthConfiguration.accessTokenFunction.tokenFunctionClientClassReference
        );
    }

    private static getProperties(
        oauthType: OauthType,
        oauthConfiguration: OauthTokenProvider.ClientCredentialsInit
    ): Property[] {
        switch (oauthType) {
            case "client_credentials": {
                const properties = [
                    new Property({
                        name: "client_id",
                        type: StringClassReference
                    }),
                    new Property({
                        name: "client_secret",
                        type: StringClassReference
                    }),
                    new Property({
                        name: "auth_client",
                        type: StringClassReference
                    })
                ];
                if (OauthTokenProvider.isRefreshClientSeperate(oauthConfiguration)) {
                    properties.push(
                        new Property({
                            name: "refresh_client",
                            type: StringClassReference
                        })
                    );
                }
                return properties;
            }
            default:
                return [];
        }
    }

    private static getExpressions(oauthType: OauthType): Expression[] {
        switch (oauthType) {
            case "client_credentials": {
                return [
                    new Expression({
                        leftSide: "EXPIRY_BUFFER_MINUTES",
                        rightSide: "2",
                        isAssignment: true
                    })
                ];
            }
            default:
                return [];
        }
    }

    private static getTokenFunction(oauthType: OauthType): Function_ {
        switch (oauthType) {
            case "client_credentials": {
                return new Function_({
                    name: "token",
                    functionBody: [
                        new ConditionalStatement({
                            if_: {
                                // HACK: we don't really support nested statements like this, so doing manually for now
                                leftSide: "!@token.nil? && (@token.expires_at.nil? || @token.expires_at > Time.now)",
                                expressions: [
                                    new Expression({
                                        leftSide: "return",
                                        rightSide: "@token.access_token",
                                        isAssignment: false
                                    })
                                ]
                            }
                        }),
                        new Expression({
                            leftSide: "@token",
                            rightSide: new FunctionInvocation({
                                baseFunction: new Function_({ name: "refresh_token", functionBody: [] }),
                                arguments_: []
                            }),
                            isAssignment: true
                        }),
                        new Expression({
                            rightSide: "@token.access_token",
                            isAssignment: false
                        })
                    ],
                    documentation:
                        "Returns a cached access token retrieved from the provided client credentials, refreshing if necessary.",
                    returnValue: StringClassReference
                });
            }
            default:
                throw new Error("Invalid oauth type");
        }
    }

    private static responsePropertyToObjectAccess(responseProperty: ResponseProperty): string {
        const path = responseProperty.property.name.name.snakeCase.safeName;
        return [...(responseProperty.propertyPath ?? []).map((p) => p.snakeCase.safeName), path].join(".");
    }

    private static getAccessTokenInstantiation(
        responseVariableName: string,
        tokenResponseProperty: OAuthAccessTokenProperties,
        accessTokenReference: ClassReference
    ): FunctionInvocation {
        const accessTokenArguments = [
            new Argument({
                value: `${responseVariableName}.${OauthTokenProvider.responsePropertyToObjectAccess(
                    tokenResponseProperty.accessToken
                )}`,
                name: "access_token",
                isNamed: true
            })
        ];
        if (tokenResponseProperty.refreshToken != null) {
            accessTokenArguments.push(
                new Argument({
                    value: `${responseVariableName}.${OauthTokenProvider.responsePropertyToObjectAccess(
                        tokenResponseProperty.refreshToken
                    )}`,
                    name: "refresh",
                    isNamed: true
                })
            );
        }
        if (tokenResponseProperty.expiresIn != null) {
            accessTokenArguments.push(
                new Argument({
                    value: `Time.now + ${responseVariableName}.${OauthTokenProvider.responsePropertyToObjectAccess(
                        tokenResponseProperty.expiresIn
                    )} - (EXPIRY_BUFFER_MINUTES * 60)`,
                    name: "expires_at",
                    isNamed: true
                })
            );
        }

        return new FunctionInvocation({
            onObject: accessTokenReference,
            baseFunction: new Function_({ name: "new", functionBody: [] }),
            arguments_: accessTokenArguments
        });
    }

    private static getAdditionalFunctions(
        oauthType: OauthType,
        accessTokenReference: ClassReference,
        oauthConfiguration: OauthTokenProvider.ClientCredentialsInit
    ): Function_[] {
        switch (oauthType) {
            case "client_credentials": {
                const body: AstNode[] = [];
                const responseVariableName = "token_response";
                const clientCredentialArgs = [
                    new Argument({
                        isNamed: true,
                        name: "client_id",
                        value: "@client_id"
                    }),
                    new Argument({
                        isNamed: true,
                        name: "client_secret",
                        value: "@client_secret"
                    })
                ];
                if (oauthConfiguration.refreshTokenFunction != null) {
                    body.push(
                        new ConditionalStatement({
                            if_: {
                                // HACK: we don't really support nested statements like this, so doing manually for now
                                leftSide: new FunctionInvocation({
                                    onObject: "@token",
                                    baseFunction: new Function_({
                                        name: "nil?",
                                        functionBody: []
                                    }),
                                    optionalSafeCall: false
                                }),
                                operation: "||",
                                rightSide: new FunctionInvocation({
                                    onObject: "@token.refresh_token",
                                    baseFunction: new Function_({
                                        name: "nil?",
                                        functionBody: []
                                    }),
                                    optionalSafeCall: false
                                }),
                                expressions: [
                                    new Expression({
                                        leftSide: responseVariableName,
                                        rightSide: new FunctionInvocation({
                                            onObject: "@auth_client",
                                            baseFunction: oauthConfiguration.accessTokenFunction.tokenFunction,
                                            arguments_: clientCredentialArgs,
                                            useFullPath: false
                                        }),
                                        isAssignment: true
                                    }),
                                    new Expression({
                                        leftSide: "return",
                                        rightSide: OauthTokenProvider.getAccessTokenInstantiation(
                                            responseVariableName,
                                            oauthConfiguration.accessTokenFunction.tokenResponseProperty,
                                            accessTokenReference
                                        ),
                                        isAssignment: false
                                    })
                                ]
                            },
                            else_: [
                                new Expression({
                                    leftSide: responseVariableName,
                                    rightSide: new FunctionInvocation({
                                        onObject: OauthTokenProvider.isRefreshClientSeperate(oauthConfiguration)
                                            ? "@refresh_client"
                                            : "@auth_client",
                                        baseFunction: oauthConfiguration.refreshTokenFunction.tokenFunction,
                                        arguments_: [
                                            ...clientCredentialArgs,
                                            new Argument({
                                                isNamed: true,
                                                name: "referesh_token",
                                                value: "@token.refresh_token"
                                            })
                                        ],
                                        useFullPath: false
                                    }),
                                    isAssignment: true
                                }),
                                new Expression({
                                    leftSide: "return",
                                    rightSide: OauthTokenProvider.getAccessTokenInstantiation(
                                        responseVariableName,
                                        oauthConfiguration.refreshTokenFunction.tokenResponseProperty,
                                        accessTokenReference
                                    ),
                                    isAssignment: false
                                })
                            ]
                        })
                    );
                } else {
                    body.push(
                        ...[
                            new Expression({
                                leftSide: responseVariableName,
                                rightSide: new FunctionInvocation({
                                    onObject: "@auth_client",
                                    baseFunction: oauthConfiguration.accessTokenFunction.tokenFunction,
                                    arguments_: clientCredentialArgs,
                                    useFullPath: false
                                }),
                                isAssignment: true
                            }),
                            new Expression({
                                leftSide: "return",
                                rightSide: OauthTokenProvider.getAccessTokenInstantiation(
                                    responseVariableName,
                                    oauthConfiguration.accessTokenFunction.tokenResponseProperty,
                                    accessTokenReference
                                ),
                                isAssignment: false
                            })
                        ]
                    );
                }

                return [
                    new Function_({
                        name: "refresh_token",
                        functionBody: body,
                        returnValue: accessTokenReference
                    })
                ];
            }
            default:
                return [];
        }
    }
}
