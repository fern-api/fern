import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpMethodSchema } from "@fern-api/yaml-schema/src/schemas";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration";
import { EndpointLocation } from "./FernDefnitionBuilder";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getHeaderName } from "./utils/getHeaderName";

const OAUTH_SCHEME = "OAuthScheme";
const BASIC_AUTH_SCHEME = "BasicAuthScheme";
const BEARER_AUTH_SCHEME = "BearerAuthScheme";

export function buildAuthSchemes(context: OpenApiIrConverterContext): void {
    let setAuth = false;

    const authOverrides = context.generatorsConfiguration?.rawConfiguration["auth-schemes"];

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
            if (securityScheme.value.type === "unrecognized") {
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
                if (securityScheme.value.scopesEnum != null && securityScheme.value.scopesEnum.values.length > 0) {
                    context.builder.addType(RelativeFilePath.of("__package__.yml"), {
                        name: "OauthScope",
                        schema: buildEnumTypeDeclaration(securityScheme.value.scopesEnum).schema
                    });
                }
            } else {
                const accessTokenEndpoint = securityScheme.value.tokenEndpoint;
                const maybeRefreshTokenEndpoint = securityScheme.value.refreshEndpoint;

                const [atMethod, atUrl] = getMethodAndUrl(accessTokenEndpoint.endpointReference);
                const maybeAccessTokenEndpointFernReference = atMethod
                    ? context.builder.getEndpoint(atMethod, atUrl)
                    : context.builder.getEndpointWithoutMethod(atUrl);

                let maybeRefreshTokenEndpointFernReference: EndpointLocation | undefined;
                if (maybeRefreshTokenEndpoint != null) {
                    const [rtMethod, rtUrl] = getMethodAndUrl(maybeRefreshTokenEndpoint.endpointReference);
                    maybeRefreshTokenEndpointFernReference = rtMethod
                        ? context.builder.getEndpoint(rtMethod, rtUrl)
                        : context.builder.getEndpointWithoutMethod(rtUrl);
                }

                if (maybeAccessTokenEndpointFernReference == null) {
                    throw new Error(
                        `Failed to resolve the provided access token endpoint: method - ${atMethod} url - ${atUrl}.`
                    );
                }
                const endpointImports = [];
                endpointImports.push(maybeAccessTokenEndpointFernReference.file);
                if (maybeRefreshTokenEndpointFernReference != null) {
                    endpointImports.push(maybeRefreshTokenEndpointFernReference.file);
                }

                context.builder.addAuthScheme({
                    name: OAUTH_SCHEME,
                    schema: {
                        scheme: "oauth",
                        type: "client-credentials",
                        scopes: securityScheme.value.scopes,
                        "client-id-env": securityScheme.value.clientIdEnvVar,
                        "client-secret-env": securityScheme.value.clientSecretEnvVar,
                        "token-prefix": securityScheme.value.tokenPrefix,
                        "get-token": {
                            endpoint: maybeAccessTokenEndpointFernReference.endpointReference,
                            "request-properties": {
                                "client-id": accessTokenEndpoint.requestProperties.clientId,
                                "client-secret": accessTokenEndpoint.requestProperties.clientSecret,
                                scopes: accessTokenEndpoint.requestProperties.scopes
                            },
                            "response-properties": {
                                "access-token": accessTokenEndpoint.responseProperties.accessToken,
                                "expires-in": accessTokenEndpoint.responseProperties.expiresIn,
                                "refresh-token": accessTokenEndpoint.responseProperties.refreshToken
                            }
                        },
                        "refresh-token":
                            maybeRefreshTokenEndpoint != null && maybeRefreshTokenEndpointFernReference != null
                                ? {
                                      endpoint: maybeRefreshTokenEndpointFernReference.endpointReference,
                                      "request-properties": {
                                          "refresh-token": maybeRefreshTokenEndpoint.requestProperties.refreshToken
                                      },
                                      "response-properties": {
                                          "access-token": maybeRefreshTokenEndpoint.responseProperties.accessToken,
                                          "expires-in": maybeRefreshTokenEndpoint.responseProperties.expiresIn,
                                          "refresh-token": maybeRefreshTokenEndpoint.responseProperties.refreshToken
                                      }
                                  }
                                : undefined
                    },
                    additionalImports: endpointImports
                });

                if (!setAuth) {
                    context.builder.setAuth(OAUTH_SCHEME);
                    setAuth = true;
                }
            }
        }
    }

    // Run through the authOverrides and add in the schemes so that these schemes take
    // precedence over the ones that were in the OAS spec.
    for (const [name, scheme] of Object.entries(authOverrides ?? {})) {
        if ("header" in scheme) {
            context.builder.addAuthScheme({
                name,
                schema: {
                    header: scheme.header,
                    name: scheme.header,
                    type: scheme.type,
                    env: scheme.env,
                    prefix: scheme.prefix
                }
            });
            if (!setAuth) {
                context.builder.setAuth(name);
                setAuth = true;
            }
        } else if (scheme.scheme === "basic") {
            context.builder.addAuthScheme({
                name,
                schema: {
                    scheme: "basic",
                    username: {
                        name: scheme.username?.name,
                        env: scheme.username?.env
                    },
                    password: {
                        name: scheme.password?.name,
                        env: scheme.password?.env
                    }
                }
            });
            if (!setAuth) {
                context.builder.setAuth(name);
                setAuth = true;
            }
        } else if (scheme.scheme === "bearer") {
            context.builder.addAuthScheme({
                name,
                schema: {
                    scheme: "bearer",
                    token: {
                        name: scheme.token?.name,
                        env: scheme.token?.env
                    }
                }
            });
            if (!setAuth) {
                context.builder.setAuth(name);
                setAuth = true;
            }
        } else if (scheme.scheme === "oauth") {
            const [atMethod, atUrl] = getMethodAndUrl(scheme["get-token"]?.endpoint);
            const maybeAccessTokenEndpointFernReference = atMethod
                ? context.builder.getEndpoint(atMethod, atUrl)
                : context.builder.getEndpointWithoutMethod(atUrl);

            let maybeRefreshTokenEndpointFernReference: EndpointLocation | undefined;
            if (scheme["refresh-token"]?.endpoint != null) {
                const [rtMethod, rtUrl] = getMethodAndUrl(scheme["refresh-token"]?.endpoint);
                maybeRefreshTokenEndpointFernReference = rtMethod
                    ? context.builder.getEndpoint(rtMethod, rtUrl)
                    : context.builder.getEndpointWithoutMethod(rtUrl);
            }

            if (maybeAccessTokenEndpointFernReference == null) {
                throw new Error(
                    `Failed to resolve the provided access token endpoint: method - ${atMethod} url - ${atUrl}.`
                );
            }

            const endpointImports = [];
            endpointImports.push(maybeAccessTokenEndpointFernReference.file);
            if (maybeRefreshTokenEndpointFernReference != null) {
                endpointImports.push(maybeRefreshTokenEndpointFernReference.file);
            }

            context.builder.addAuthScheme({
                name,
                schema: {
                    scheme: "oauth",
                    type: "client-credentials",
                    scopes: scheme.scopes,
                    "client-id-env": scheme["client-id-env"],
                    "client-secret-env": scheme["client-secret-env"],
                    "token-prefix": scheme["token-prefix"],
                    "get-token": {
                        endpoint: maybeAccessTokenEndpointFernReference.endpointReference,
                        "request-properties": scheme["get-token"]["request-properties"],
                        "response-properties": scheme["get-token"]["response-properties"]
                    },
                    "refresh-token":
                        scheme["refresh-token"] != null && maybeRefreshTokenEndpointFernReference != null
                            ? {
                                  endpoint: maybeRefreshTokenEndpointFernReference.endpointReference,
                                  "request-properties": scheme["refresh-token"]["request-properties"],
                                  "response-properties": scheme["refresh-token"]["response-properties"]
                              }
                            : undefined
                },
                additionalImports: endpointImports
            });

            if (!setAuth) {
                context.builder.setAuth(name);
                setAuth = true;
            }
        }
    }
}

function getMethodAndUrl(endpointReference: string): [string | undefined, string] {
    const splitOperation = endpointReference.split(" ");

    if (splitOperation.length === 1) {
        return [undefined, endpointReference];
    } else if (splitOperation.length === 2) {
        // We'll throw an error here if the method is not a valid HTTP method
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const method = HttpMethodSchema.parse(splitOperation[0]!.toUpperCase());
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return [method, splitOperation[1]!];
    }

    throw new Error(
        `Invalid endpoint reference provided: ${endpointReference}, expected refrence of format '<METHOD> <URL>' or '<URL>'`
    );
}
