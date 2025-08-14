import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    ApiAuth,
    AuthScheme,
    AuthSchemesRequirement,
    FernIr,
    InferredAuthSchemeTokenEndpoint,
    OAuthConfiguration
} from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { EndpointResolver } from "../resolvers/EndpointResolver";
import { PropertyResolver } from "../resolvers/PropertyResolver";
import { ResolvedEndpoint } from "../resolvers/ResolvedEndpoint";
import { createEndpointReference } from "../utils/createEndpointReference";
import { convertOAuthClientCredentials } from "./convertOAuthClientCredentials";
import { get0AuthTokenEndpoint, getRefreshTokenEndpoint } from "./convertOAuthUtils";
import { getResponsePropertyComponents } from "./services/convertProperty";

export function convertApiAuth({
    rawApiFileSchema,
    file,
    propertyResolver,
    endpointResolver
}: {
    rawApiFileSchema: RawSchemas.WithAuthSchema;
    file: FernFileContext;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
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
        single: (authScheme) => {
            const schemaReference = convertSchemeReference({
                reference: authScheme,
                authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                file,
                propertyResolver,
                endpointResolver
            });
            return {
                docs,
                requirement: AuthSchemesRequirement.All,
                schemes: [schemaReference]
            };
        },
        any: ({ any }) => ({
            docs,
            requirement: AuthSchemesRequirement.Any,
            schemes: any.map((schemeReference) =>
                convertSchemeReference({
                    reference: schemeReference,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    file,
                    propertyResolver,
                    endpointResolver
                })
            )
        })
    });
}

function convertSchemeReference({
    reference,
    authSchemeDeclarations,
    file,
    propertyResolver,
    endpointResolver
}: {
    reference: RawSchemas.AuthSchemeReferenceSchema | string;
    authSchemeDeclarations: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined;
    file: FernFileContext;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
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
            tokenBearer: (rawScheme) =>
                generateBearerAuth({
                    file,
                    docs,
                    rawScheme
                }),
            inferredBearer: (rawScheme) =>
                generateInferredAuth({
                    file,
                    docs,
                    rawScheme,
                    propertyResolver,
                    endpointResolver
                }),
            oauth: (rawScheme) =>
                generateOAuth({
                    file,
                    docs,
                    rawScheme,
                    propertyResolver,
                    endpointResolver
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
        case "oauth":
            return generateOAuth({
                file,
                docs: undefined,
                rawScheme: undefined,
                propertyResolver,
                endpointResolver
            });
        default:
            return convertNamedAuthSchemeReference(scheme, typeof reference !== "string" ? reference.docs : undefined);
    }
}

function generateBearerAuth({
    file,
    docs,
    rawScheme
}: {
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.TokenBearerAuthSchema | undefined;
}): AuthScheme.Bearer {
    return AuthScheme.bearer({
        docs,
        token: file.casingsGenerator.generateName(rawScheme?.token?.name ?? "token"),
        tokenEnvVar: rawScheme?.token?.env
    });
}

function generateBasicAuth({
    file,
    docs,
    rawScheme
}: {
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.BasicAuthSchemeSchema | undefined;
}): AuthScheme.Basic {
    return AuthScheme.basic({
        docs,
        username: file.casingsGenerator.generateName(rawScheme?.username?.name ?? "username"),
        usernameEnvVar: rawScheme?.username?.env,
        password: file.casingsGenerator.generateName(rawScheme?.password?.name ?? "password"),
        passwordEnvVar: rawScheme?.password?.env
    });
}

function generateOAuth({
    file,
    docs,
    rawScheme,
    propertyResolver,
    endpointResolver
}: {
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.OAuthSchemeSchema | undefined;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
}): AuthScheme.Oauth {
    switch (rawScheme?.type) {
        case "client-credentials":
            return AuthScheme.oauth({
                docs,
                configuration: OAuthConfiguration.clientCredentials(
                    convertOAuthClientCredentials({
                        propertyResolver,
                        endpointResolver,
                        file,
                        oauthScheme: rawScheme,
                        tokenEndpoint: get0AuthTokenEndpoint(rawScheme),
                        refreshTokenEndpoint: getRefreshTokenEndpoint(rawScheme)
                    })
                )
            });
        default:
            throw new Error(`Unknown OAuth type: '${rawScheme?.type}'`);
    }
}

function generateInferredAuth({
    file,
    docs,
    rawScheme,
    propertyResolver,
    endpointResolver
}: {
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.InferredBearerAuthSchema;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
}): AuthScheme.Inferred {
    return AuthScheme.inferred({
        docs,
        tokenEndpoint: getInferredTokenEndpoint({
            file,
            rawScheme,
            propertyResolver,
            endpointResolver
        })
    });
}

function getInferredTokenEndpoint({
    file,
    rawScheme,
    propertyResolver,
    endpointResolver
}: {
    file: FernFileContext;
    rawScheme: RawSchemas.InferredBearerAuthSchema;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
}): InferredAuthSchemeTokenEndpoint {
    let getTokenEndpointConfigOrString: RawSchemas.InferredGetTokenEndpointSchema = rawScheme["get-token"];
    const getTokenEndpointConfig: RawSchemas.InferredGetTokenEndpointSchemaObject =
        typeof getTokenEndpointConfigOrString === "string"
            ? {
                  endpoint: getTokenEndpointConfigOrString
              }
            : getTokenEndpointConfigOrString;

    const tokenEndpoint = endpointResolver.resolveEndpointOrThrow({
        endpoint: getTokenEndpointConfig.endpoint,
        file
    });

    const result: InferredAuthSchemeTokenEndpoint = {
        endpoint: createEndpointReference({ resolvedEndpoint: tokenEndpoint }),
        expiryProperty: inferExpiryProperty({
            tokenEndpoint,
            getTokenEndpointConfig,
            propertyResolver
        }),
        authenticatedRequestHeaders: getInferredAuthenticatedRequestHeaders({
            tokenEndpoint,
            getTokenEndpointConfig,
            propertyResolver
        })
    };

    return result;
}

const commonAuthTokenProperties = [
    "access_token",
    "accessToken",
    "AccessToken",
    "token",
    "Token",
    "auth_token",
    "authToken",
    "AuthToken",
    "bearer_token",
    "bearerToken",
    "BearerToken",
    "jwt",
    "Jwt",
    "authentication_token",
    "authenticationToken",
    "AuthenticationToken"
];

function getInferredAuthenticatedRequestHeaders({
    tokenEndpoint,
    getTokenEndpointConfig,
    propertyResolver
}: {
    tokenEndpoint: ResolvedEndpoint;
    getTokenEndpointConfig: RawSchemas.InferredGetTokenEndpointSchemaObject;
    propertyResolver: PropertyResolver;
}): FernIr.InferredAuthenticatedRequestHeader[] {
    const result = new Map<string, FernIr.InferredAuthenticatedRequestHeader>();
    const requestHeaders = getTokenEndpointConfig["authenticated-request-headers"] ?? [];
    if (requestHeaders.length > 0) {
        requestHeaders.forEach((header) => {
            result.set(header["header-name"].toLowerCase(), {
                headerName: header["header-name"],
                responseProperty: propertyResolver.resolveResponsePropertyOrThrow({
                    file: tokenEndpoint.file,
                    endpoint: tokenEndpoint.endpointId,
                    propertyComponents: getResponsePropertyComponents(header["response-property"])
                }),
                valuePrefix: header["value-prefix"]
            });
        });
    }
    if (!result.has("authorization")) {
        const authTokenResponseProperty = inferAuthTokenResponseProperty({
            tokenEndpoint,
            propertyResolver
        });
        if (authTokenResponseProperty) {
            result.set("authorization", {
                headerName: "Authorization",
                responseProperty: authTokenResponseProperty,
                valuePrefix: "Bearer "
            });
        }
    }
    return Array.from(result.values());
}

function inferAuthTokenResponseProperty({
    tokenEndpoint,
    propertyResolver
}: {
    tokenEndpoint: ResolvedEndpoint;
    propertyResolver: PropertyResolver;
}): FernIr.ResponseProperty | undefined {
    for (const property of commonAuthTokenProperties) {
        try {
            const responseProperty = propertyResolver.resolveResponseProperty({
                file: tokenEndpoint.file,
                endpoint: tokenEndpoint.endpointId,
                propertyComponents: [property]
            });
            if (responseProperty) {
                return responseProperty;
            }
        } catch (e) {
            // Ignore errors
        }
    }
    return undefined;
}

const commonExpiryProperties = [
    "expires_in",
    "expiresIn",
    "ExpiresIn",
    "exp",
    "Exp",
    "expiry",
    "Expiry",
    "expires",
    "Expires",
    "expires_at",
    "expiresAt",
    "ExpiresAt",
    "expiration",
    "Expiration",
    "valid_until",
    "validUntil",
    "ValidUntil"
];

function inferExpiryProperty({
    tokenEndpoint,
    getTokenEndpointConfig,
    propertyResolver
}: {
    tokenEndpoint: ResolvedEndpoint;
    getTokenEndpointConfig: RawSchemas.InferredGetTokenEndpointSchemaObject;
    propertyResolver: PropertyResolver;
}): FernIr.ResponseProperty | undefined {
    if (getTokenEndpointConfig["expiry-response-property"]) {
        return propertyResolver.resolveResponsePropertyOrThrow({
            file: tokenEndpoint.file,
            endpoint: tokenEndpoint.endpointId,
            propertyComponents: getResponsePropertyComponents(getTokenEndpointConfig["expiry-response-property"])
        });
    }
    for (const property of commonExpiryProperties) {
        try {
            const responseProperty = propertyResolver.resolveResponseProperty({
                file: tokenEndpoint.file,
                endpoint: tokenEndpoint.endpointId,
                propertyComponents: [property]
            });
            if (responseProperty) {
                return responseProperty;
            }
        } catch (e) {
            // Ignore errors
        }
    }
    return undefined;
}
