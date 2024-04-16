import { ApiAuth, AuthScheme, AuthSchemesRequirement, HttpMethod, OAuthConfiguration } from "@fern-api/ir-sdk";
import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";

export function convertApiAuth({
    rawApiFileSchema,
    file
}: {
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
    file: FernFileContext;
}): ApiAuth {
    if (rawApiFileSchema.auth == null) {
        return {
            docs: undefined,
            requirement: AuthSchemesRequirement.All,
            schemes: []
        };
    }

    const docs = typeof rawApiFileSchema.auth !== "string" ? rawApiFileSchema.auth.docs : undefined;
    return visitRawApiAuth<ApiAuth>(rawApiFileSchema.auth, {
        single: (authScheme) => ({
            docs,
            requirement: AuthSchemesRequirement.All,
            schemes: [
                convertSchemeReference({
                    reference: authScheme,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    file
                })
            ]
        }),
        any: ({ any }) => ({
            docs,
            requirement: AuthSchemesRequirement.Any,
            schemes: any.map((schemeReference) =>
                convertSchemeReference({
                    reference: schemeReference,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    file
                })
            )
        })
    });
}

function convertSchemeReference({
    reference,
    authSchemeDeclarations,
    file
}: {
    reference: RawSchemas.AuthSchemeReferenceSchema | string;
    authSchemeDeclarations: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined;
    file: FernFileContext;
}): AuthScheme {
    const convertNamedAuthSchemeReference = (reference: string, docs: string | undefined) => {
        const declaration = authSchemeDeclarations?.[reference];
        if (declaration == null) {
            throw new Error("Unknown auth scheme: " + reference);
        }
        return visitRawAuthSchemeDeclaration<AuthScheme>(declaration, {
            header: (rawHeader) =>
                AuthScheme.header({
                    docs,
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: rawHeader.name ?? reference,
                        wireValue: rawHeader.header
                    }),
                    valueType: file.parseTypeReference(rawHeader.type ?? "string"),
                    prefix: rawHeader.prefix,
                    headerEnvVar: rawHeader.env
                }),
            basic: (rawScheme) =>
                generateBasicAuth({
                    file,
                    docs,
                    rawScheme
                }),
            bearer: (rawScheme) =>
                generateBearerAuth({
                    file,
                    docs,
                    rawScheme
                }),
            oauth: (rawScheme) =>
                generateOAuth({
                    docs,
                    file,
                    rawScheme
                })
        });
    };

    const scheme = typeof reference === "string" ? reference : reference.scheme;

    switch (scheme) {
        case "bearer":
            return generateBearerAuth({
                file,
                docs: undefined,
                rawScheme: undefined
            });
        case "basic":
            return generateBasicAuth({
                file,
                docs: undefined,
                rawScheme: undefined
            });
        default:
            return convertNamedAuthSchemeReference(scheme, typeof reference !== "string" ? reference.docs : undefined);
    }
}

function generateOAuth({
    docs,
    file,
    rawScheme
}: {
    docs: string | undefined;
    file: FernFileContext;
    rawScheme: RawSchemas.OAuthSchemeSchema | undefined;
}): AuthScheme.Oauth {
    if (rawScheme != null && rawScheme?.type === "authorization-code") {
        return AuthScheme.oauth({
            docs,
            configuration: OAuthConfiguration.authorizationCode({
                clientIdEnvVar: rawScheme["client-id-env"],
                clientSecretEnvVar: rawScheme["client-secret-env"],
                tokenPrefix: rawScheme["token-prefix"],
                scopes: rawScheme.scopes,
                authorizationCodeEnvVar: rawScheme["authorization-code-env"],
                authorizationEndpoint: {
                    path: rawScheme["authorization-endpoint"].path,
                    queryParameters: Object.entries(rawScheme["authorization-endpoint"]["query-parameters"]).map(
                        ([key, value]) => ({
                            name: file.casingsGenerator.generateNameAndWireValue({
                                name: key,
                                wireValue: key
                            }),
                            type: file.parseTypeReference(value)
                        })
                    )
                },
                tokenEndpoint: {
                    endpointReference: {
                        path: rawScheme["token-endpoint"].endpoint.path,
                        method: rawScheme["token-endpoint"].endpoint.method as HttpMethod
                    },
                    responseFields: {
                        accessToken: rawScheme["token-endpoint"]["response-fields"]["access-token"],
                        expiresIn: rawScheme["token-endpoint"]["response-fields"]["expires-in"],
                        refreshToken: rawScheme["token-endpoint"]["response-fields"]["refresh-token"]
                    }
                },
                refreshEndpoint:
                    rawScheme["refresh-endpoint"] != null
                        ? {
                              endpointReference: {
                                  path: rawScheme["refresh-endpoint"].endpoint.path,
                                  method: rawScheme["refresh-endpoint"].endpoint.method as HttpMethod
                              },
                              requestFields: {
                                  refreshToken: rawScheme["refresh-endpoint"]["request-fields"]["refresh-token"]
                              },
                              responseFields: {
                                  accessToken: rawScheme["refresh-endpoint"]["response-fields"]["access-token"],
                                  expiresIn: rawScheme["refresh-endpoint"]["response-fields"]["expires-in"],
                                  refreshToken: rawScheme["refresh-endpoint"]["response-fields"]["refresh-token"]
                              }
                          }
                        : undefined,
                redirectUri: rawScheme["redirect-uri"]
            })
        });
    } else if (rawScheme != null && rawScheme?.type === "client-credentials") {
        return AuthScheme.oauth({
            docs,
            configuration: OAuthConfiguration.clientCredentials({
                clientIdEnvVar: rawScheme["client-id-env"],
                clientSecretEnvVar: rawScheme["client-secret-env"],
                tokenPrefix: rawScheme["token-prefix"],
                scopes: rawScheme.scopes,
                tokenEndpoint: {
                    endpointReference: {
                        path: rawScheme["token-endpoint"].endpoint.path,
                        method: rawScheme["token-endpoint"].endpoint.method as HttpMethod
                    },
                    responseFields: {
                        accessToken: rawScheme["token-endpoint"]["response-fields"]["access-token"],
                        expiresIn: rawScheme["token-endpoint"]["response-fields"]["expires-in"],
                        refreshToken: rawScheme["token-endpoint"]["response-fields"]["refresh-token"]
                    }
                },
                refreshEndpoint:
                    rawScheme["refresh-endpoint"] != null
                        ? {
                              endpointReference: {
                                  path: rawScheme["refresh-endpoint"].endpoint.path,
                                  method: rawScheme["refresh-endpoint"].endpoint.method as HttpMethod
                              },
                              requestFields: {
                                  refreshToken: rawScheme["refresh-endpoint"]["request-fields"]["refresh-token"]
                              },
                              responseFields: {
                                  accessToken: rawScheme["refresh-endpoint"]["response-fields"]["access-token"],
                                  expiresIn: rawScheme["refresh-endpoint"]["response-fields"]["expires-in"],
                                  refreshToken: rawScheme["refresh-endpoint"]["response-fields"]["refresh-token"]
                              }
                          }
                        : undefined,
                redirectUri: rawScheme["redirect-uri"]
            })
        });
    } else {
        throw new Error("Unknown OAuth definition");
    }
}

function generateBearerAuth({
    docs,
    rawScheme,
    file
}: {
    docs: string | undefined;
    rawScheme: RawSchemas.BearerAuthSchemeSchema | undefined;
    file: FernFileContext;
}): AuthScheme.Bearer {
    return AuthScheme.bearer({
        docs,
        token: file.casingsGenerator.generateName(rawScheme?.token?.name ?? "token"),
        tokenEnvVar: rawScheme?.token?.env
    });
}

function generateBasicAuth({
    docs,
    rawScheme,
    file
}: {
    docs: string | undefined;
    rawScheme: RawSchemas.BasicAuthSchemeSchema | undefined;
    file: FernFileContext;
}): AuthScheme.Basic {
    return AuthScheme.basic({
        docs,
        username: file.casingsGenerator.generateName(rawScheme?.username?.name ?? "username"),
        usernameEnvVar: rawScheme?.username?.env,
        password: file.casingsGenerator.generateName(rawScheme?.password?.name ?? "password"),
        passwordEnvVar: rawScheme?.password?.env
    });
}
