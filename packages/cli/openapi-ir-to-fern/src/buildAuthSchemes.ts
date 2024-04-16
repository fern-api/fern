import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getHeaderName } from "./utils/getHeaderName";

const BASIC_AUTH_SCHEME = "BasicAuthScheme";
const BEARER_AUTH_SCHEME = "BearerAuthScheme";
const OAUTH_SCHEME = "OAuthScheme";

export function buildAuthSchemes(context: OpenApiIrConverterContext): void {
    let setAuth = false;

    for (const [id, securityScheme] of Object.entries(context.ir.securitySchemes)) {
        if (securityScheme.type === "basic") {
            const basicAuthScheme: RawSchemas.BasicAuthSchemeSchema = {
                scheme: "basic"
            };

            if (securityScheme.usernameVariableName != null) {
                if (basicAuthScheme.username === undefined) {
                    basicAuthScheme.username = {
                        name: securityScheme.usernameVariableName
                    };
                } else {
                    basicAuthScheme.username.name = securityScheme.usernameVariableName;
                }
            }
            if (securityScheme.usernameEnvVar != null) {
                if (basicAuthScheme.username === undefined) {
                    basicAuthScheme.username = {
                        env: securityScheme.usernameEnvVar
                    };
                } else {
                    basicAuthScheme.username.env = securityScheme.usernameEnvVar;
                }
            }

            if (securityScheme.passwordVariableName != null) {
                if (basicAuthScheme.password === undefined) {
                    basicAuthScheme.password = {
                        name: securityScheme.passwordVariableName
                    };
                } else {
                    basicAuthScheme.password.name = securityScheme.passwordVariableName;
                }
            }
            if (securityScheme.passwordEnvVar != null) {
                if (basicAuthScheme.password === undefined) {
                    basicAuthScheme.password = {
                        env: securityScheme.passwordEnvVar
                    };
                } else {
                    basicAuthScheme.password.env = securityScheme.passwordEnvVar;
                }
            }

            context.builder.addAuthScheme({
                name: BASIC_AUTH_SCHEME,
                schema: basicAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(BASIC_AUTH_SCHEME);
                setAuth = true;
            }
        } else if (securityScheme.type === "bearer") {
            const bearerAuthScheme: RawSchemas.AuthSchemeDeclarationSchema = {
                scheme: "bearer"
            };

            if (securityScheme.tokenVariableName != null) {
                if (bearerAuthScheme.token === undefined) {
                    bearerAuthScheme.token = {
                        name: securityScheme.tokenVariableName
                    };
                } else {
                    bearerAuthScheme.token.name = securityScheme.tokenVariableName;
                }
            }
            if (securityScheme.tokenEnvVar != null) {
                if (bearerAuthScheme.token === undefined) {
                    bearerAuthScheme.token = {
                        env: securityScheme.tokenEnvVar
                    };
                } else {
                    bearerAuthScheme.token.env = securityScheme.tokenEnvVar;
                }
            }

            context.builder.addAuthScheme({
                name: BEARER_AUTH_SCHEME,
                schema: bearerAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(BEARER_AUTH_SCHEME);
                setAuth = true;
            }
        } else if (securityScheme.type === "header") {
            if (!setAuth) {
                const schema: RawSchemas.AuthSchemeDeclarationSchema = {
                    header: securityScheme.headerName,
                    name: securityScheme.headerVariableName ?? "apiKey",
                    type: "string"
                };
                if (securityScheme.headerEnvVar != null) {
                    schema.env = securityScheme.headerEnvVar;
                }
                if (securityScheme.prefix != null) {
                    schema.prefix = securityScheme.prefix;
                }
                context.builder.addAuthScheme({
                    name: id,
                    schema
                });
                context.builder.setAuth(id);
                setAuth = true;
            } else {
                context.builder.addGlobalHeader({
                    name: securityScheme.headerName,
                    schema: {
                        type: "string",
                        name: securityScheme.headerVariableName ?? getHeaderName(securityScheme.headerName),
                        env: securityScheme.headerEnvVar
                    }
                });
            }
        } else if (securityScheme.type === "oauth") {
            if (securityScheme.configuration != null) {
                const subScheme = securityScheme.configuration._visit<RawSchemas.OAuthSchemeSchema | undefined>({
                    authorizationCode: (config) => ({
                        scheme: "oauth",
                        "client-id-env": config.clientIdEnvVar,
                        "client-secret-env": config.clientSecretEnvVar,
                        "redirect-uri": config.redirectUri,
                        "token-prefix": config.tokenPrefix,
                        scopes: config.defaultScopes,
                        type: "authorization-code",
                        "authorization-code-env": config.authorizationCodeEnvVar,
                        "authorization-endpoint": {
                            path: config.authorizationEndpoint.path,
                            "query-parameters": config.authorizationEndpoint.parameters.reduce((acc, val) => {
                                acc[val] = "string";
                                return acc;
                            }, {} as Record<string, string>)
                        },
                        "token-endpoint": {
                            endpoint: config.tokenEndpoint.endpointReference,
                            "response-fields": {
                                "access-token": config.tokenEndpoint.responseFields.accessToken,
                                "expires-in": config.tokenEndpoint.responseFields.expiresIn,
                                "refresh-token": config.tokenEndpoint.responseFields.refreshToken
                            }
                        },
                        "refresh-endpoint":
                            config.refreshEndpoint != null
                                ? {
                                      endpoint: config.refreshEndpoint.endpointReference,
                                      "request-fields": {
                                          "refresh-token": config.refreshEndpoint.requestFields.refreshToken
                                      },
                                      "response-fields": {
                                          "access-token": config.refreshEndpoint.responseFields.accessToken,
                                          "expires-in": config.refreshEndpoint.responseFields.expiresIn,
                                          "refresh-token": config.refreshEndpoint.responseFields.refreshToken
                                      }
                                  }
                                : undefined
                    }),
                    clientCredentials: (config) => ({
                        scheme: "oauth",
                        "client-id-env": config.clientIdEnvVar,
                        "client-secret-env": config.clientSecretEnvVar,
                        "redirect-uri": config.redirectUri,
                        "token-prefix": config.tokenPrefix,
                        scopes: config.defaultScopes,
                        type: "client-credentials",
                        "token-endpoint": {
                            endpoint: config.tokenEndpoint.endpointReference,
                            "response-fields": {
                                "access-token": config.tokenEndpoint.responseFields.accessToken,
                                "expires-in": config.tokenEndpoint.responseFields.expiresIn,
                                "refresh-token": config.tokenEndpoint.responseFields.refreshToken
                            }
                        },
                        "refresh-endpoint":
                            config.refreshEndpoint != null
                                ? {
                                      endpoint: config.refreshEndpoint.endpointReference,
                                      "request-fields": {
                                          "refresh-token": config.refreshEndpoint.requestFields.refreshToken
                                      },
                                      "response-fields": {
                                          "access-token": config.refreshEndpoint.responseFields.accessToken,
                                          "expires-in": config.refreshEndpoint.responseFields.expiresIn,
                                          "refresh-token": config.refreshEndpoint.responseFields.refreshToken
                                      }
                                  }
                                : undefined
                    }),
                    _other: () => {
                        return undefined;
                    }
                });
                if (subScheme != null) {
                    context.builder.addAuthScheme({
                        name: OAUTH_SCHEME,
                        schema: subScheme
                    });

                    if (!setAuth) {
                        context.builder.setAuth(OAUTH_SCHEME);
                        setAuth = true;
                    }
                }
            } else {
                const bearerAuthScheme: RawSchemas.AuthSchemeDeclarationSchema = {
                    scheme: "bearer"
                };
                context.builder.addAuthScheme({
                    name: BEARER_AUTH_SCHEME,
                    schema: bearerAuthScheme
                });
                if (!setAuth) {
                    context.builder.setAuth(BEARER_AUTH_SCHEME);
                    setAuth = true;
                }
            }

            if (securityScheme.scopesEnum != null && securityScheme.scopesEnum.values.length > 0) {
                context.builder.addType(RelativeFilePath.of("__package__.yml"), {
                    name: "OauthScope",
                    schema: buildEnumTypeDeclaration(securityScheme.scopesEnum).schema
                });
            }
        }
    }
}
