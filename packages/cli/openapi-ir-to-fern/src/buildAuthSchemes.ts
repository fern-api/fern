import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpMethodSchema } from "@fern-api/yaml-schema/src/schemas";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getHeaderName } from "./utils/getHeaderName";

const OAUTH_SCHEME = "OAuthScheme";
const BASIC_AUTH_SCHEME = "BasicAuthScheme";
const BEARER_AUTH_SCHEME = "BearerAuthScheme";

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

                let maybeRefreshTokenEndpointFernReference: string | undefined;
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
                            endpoint: maybeAccessTokenEndpointFernReference,
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
                                      endpoint: maybeRefreshTokenEndpointFernReference,
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
                    }
                });
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
