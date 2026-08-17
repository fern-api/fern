import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    ApiAuth,
    AuthScheme,
    AuthSchemesRequirement,
    FernIr,
    InferredAuthSchemeTokenEndpoint,
    OAuthConfiguration,
    OAuthPkceMethod,
    OAuthPublicClientId
} from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";

import { FernFileContext } from "../FernFileContext.js";
import { EndpointResolver } from "../resolvers/EndpointResolver.js";
import { PropertyResolver } from "../resolvers/PropertyResolver.js";
import { ResolvedEndpoint } from "../resolvers/ResolvedEndpoint.js";
import { TypeResolver } from "../resolvers/TypeResolver.js";
import { createEndpointReference } from "../utils/createEndpointReference.js";
import { convertOAuthClientCredentials } from "./convertOAuthClientCredentials.js";
import { get0AuthTokenEndpoint, getRefreshTokenEndpoint } from "./convertOAuthUtils.js";
import { getResponsePropertyComponents } from "./services/convertProperty.js";

export function convertApiAuth({
    rawApiFileSchema,
    file,
    propertyResolver,
    endpointResolver,
    typeResolver
}: {
    rawApiFileSchema: RawSchemas.WithAuthSchema;
    file: FernFileContext;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
    typeResolver: TypeResolver;
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
                endpointResolver,
                typeResolver
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
                    endpointResolver,
                    typeResolver
                })
            )
        }),
        endpointSecurity: () => ({
            docs,
            requirement: AuthSchemesRequirement.EndpointSecurity,
            schemes: Object.keys(rawApiFileSchema["auth-schemes"] ?? {}).map((schemeName) =>
                convertSchemeReference({
                    reference: schemeName,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    file,
                    propertyResolver,
                    endpointResolver,
                    typeResolver
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
    endpointResolver,
    typeResolver
}: {
    reference: RawSchemas.AuthSchemeReferenceSchema | string;
    authSchemeDeclarations: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined;
    file: FernFileContext;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
    typeResolver: TypeResolver;
}): AuthScheme {
    const convertNamedAuthSchemeReference = (reference: string, docs: string | undefined) => {
        const declaration = authSchemeDeclarations?.[reference];
        if (declaration == null) {
            throw new CliError({ message: "Unknown auth scheme: " + reference, code: CliError.Code.ReferenceError });
        }
        return visitRawAuthSchemeDeclaration<AuthScheme>(declaration, {
            header: (rawHeader) =>
                AuthScheme.header({
                    key: reference,
                    docs,
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: rawHeader.name ?? reference,
                        wireValue: rawHeader.header
                    }),
                    valueType: file.parseTypeReference(rawHeader.type ?? "string"),
                    prefix: rawHeader.prefix,
                    headerEnvVar: rawHeader.env,
                    headerPlaceholder: rawHeader.placeholder
                }),
            basic: (rawScheme) =>
                generateBasicAuth({
                    key: reference,
                    file,
                    docs,
                    rawScheme
                }),
            tokenBearer: (rawScheme) =>
                generateBearerAuth({
                    key: reference,
                    file,
                    docs,
                    rawScheme
                }),
            inferredBearer: (rawScheme) =>
                generateInferredAuth({
                    key: reference,
                    file,
                    docs,
                    rawScheme,
                    propertyResolver,
                    endpointResolver
                }),
            oauth: (rawScheme) =>
                generateOAuth({
                    key: reference,
                    file,
                    docs,
                    rawScheme,
                    propertyResolver,
                    endpointResolver,
                    typeResolver
                })
        });
    };

    const scheme = typeof reference === "string" ? reference : reference.scheme;

    switch (scheme) {
        case "bearer":
            return generateBearerAuth({
                key: scheme,
                file,
                docs: undefined,
                rawScheme: undefined
            });
        case "basic":
            return generateBasicAuth({
                key: scheme,
                file,
                docs: undefined,
                rawScheme: undefined
            });
        case "oauth":
            return generateOAuth({
                key: scheme,
                file,
                docs: undefined,
                rawScheme: undefined,
                propertyResolver,
                endpointResolver,
                typeResolver
            });
        default:
            return convertNamedAuthSchemeReference(scheme, typeof reference !== "string" ? reference.docs : undefined);
    }
}

function generateBearerAuth({
    key,
    file,
    docs,
    rawScheme
}: {
    key: string;
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.TokenBearerAuthSchema | undefined;
}): AuthScheme.Bearer {
    return AuthScheme.bearer({
        key,
        docs,
        token: file.casingsGenerator.generateName(rawScheme?.token?.name ?? "token"),
        tokenEnvVar: rawScheme?.token?.env,
        tokenPlaceholder: rawScheme?.token?.placeholder
    });
}

function generateBasicAuth({
    key,
    file,
    docs,
    rawScheme
}: {
    key: string;
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.BasicAuthSchemeSchema | undefined;
}): AuthScheme.Basic {
    return AuthScheme.basic({
        key,
        docs,
        username: file.casingsGenerator.generateName(rawScheme?.username?.name ?? "username"),
        usernameEnvVar: rawScheme?.username?.env,
        usernameOmit: rawScheme?.username?.omit,
        usernamePlaceholder: rawScheme?.username?.placeholder,
        password: file.casingsGenerator.generateName(rawScheme?.password?.name ?? "password"),
        passwordEnvVar: rawScheme?.password?.env,
        passwordOmit: rawScheme?.password?.omit,
        passwordPlaceholder: rawScheme?.password?.placeholder
    });
}

function generateOAuth({
    key,
    file,
    docs,
    rawScheme,
    propertyResolver,
    endpointResolver,
    typeResolver
}: {
    key: string;
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.OAuthSchemeSchema | undefined;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
    typeResolver: TypeResolver;
}): AuthScheme.Oauth {
    switch (rawScheme?.type) {
        case "client-credentials":
            return AuthScheme.oauth({
                key,
                docs,
                configuration: OAuthConfiguration.clientCredentials(
                    convertOAuthClientCredentials({
                        propertyResolver,
                        endpointResolver,
                        typeResolver,
                        file,
                        oauthScheme: rawScheme,
                        tokenEndpoint: get0AuthTokenEndpoint(rawScheme),
                        refreshTokenEndpoint: getRefreshTokenEndpoint(rawScheme)
                    })
                )
            });
        case "authorization-code":
            return AuthScheme.oauth({
                key,
                docs,
                configuration: OAuthConfiguration.authorizationCode({
                    clientId: getPublicClientId(rawScheme),
                    authorizationUrl: requireOAuthField(rawScheme, "authorization-url"),
                    tokenUrl: requireOAuthField(rawScheme, "token-url"),
                    refreshUrl: rawScheme["refresh-url"],
                    redirectUri: getRedirectUri(rawScheme["redirect-uri"]),
                    redirectUriBackupPorts: getRedirectUriBackupPorts(rawScheme["redirect-uri"]),
                    successRedirectUrl: rawScheme["success-redirect-url"],
                    errorRedirectUrl: rawScheme["error-redirect-url"],
                    scopes: rawScheme.scopes,
                    pkce: { method: OAuthPkceMethod.S256 },
                    authorizationParameters: rawScheme["authorization-parameters"],
                    tokenParameters: rawScheme["token-parameters"],
                    refreshParameters: rawScheme["refresh-parameters"],
                    tokenHeader: rawScheme["token-header"],
                    tokenPrefix: rawScheme["token-prefix"]
                })
            });
        case "device-code":
            return AuthScheme.oauth({
                key,
                docs,
                configuration: OAuthConfiguration.deviceCode({
                    clientId: getPublicClientId(rawScheme),
                    deviceAuthorizationUrl: requireOAuthField(rawScheme, "device-authorization-url"),
                    tokenUrl: requireOAuthField(rawScheme, "token-url"),
                    refreshUrl: rawScheme["refresh-url"],
                    scopes: rawScheme.scopes,
                    deviceAuthorizationParameters: rawScheme["device-authorization-parameters"],
                    tokenParameters: rawScheme["token-parameters"],
                    refreshParameters: rawScheme["refresh-parameters"],
                    tokenHeader: rawScheme["token-header"],
                    tokenPrefix: rawScheme["token-prefix"]
                })
            });
        default:
            throw new CliError({
                message: `Unknown OAuth type: '${rawScheme?.type}'`,
                code: CliError.Code.ValidationError
            });
    }
}

/**
 * Resolves the public client ID for the authorization-code and device-code flows. Prefers the
 * literal `client-id`; falls back to the `client-id-env-var` environment-variable source. These
 * flows are public clients, so no client secret is involved. The validator guarantees one of the
 * two is present; the empty-string literal fallback keeps the type total.
 */
function getPublicClientId(rawScheme: RawSchemas.OAuthSchemeSchema): FernIr.OAuthPublicClientId {
    const clientIdEnvVar = rawScheme["client-id-env"];
    if (rawScheme["client-id"] == null && clientIdEnvVar != null) {
        return OAuthPublicClientId.environmentVariable(clientIdEnvVar);
    }
    return OAuthPublicClientId.literal(rawScheme["client-id"] ?? "");
}

/**
 * The raw `redirect-uri` is either a bare URI string or an object `{ url, ports }`. Flatten it into
 * the IR's single `redirectUri` (the primary callback URI) — the port fallbacks go to
 * {@link getRedirectUriBackupPorts}.
 */
function getRedirectUri(redirectUri: RawSchemas.OAuthSchemeSchema["redirect-uri"]): string | undefined {
    if (redirectUri == null) {
        return undefined;
    }
    return typeof redirectUri === "string" ? redirectUri : redirectUri.url;
}

/**
 * The `ports` list from the object form of `redirect-uri` (backup loopback ports tried when the
 * primary is busy). Undefined for the bare-string form or when omitted.
 */
function getRedirectUriBackupPorts(redirectUri: RawSchemas.OAuthSchemeSchema["redirect-uri"]): number[] | undefined {
    if (redirectUri == null || typeof redirectUri === "string") {
        return undefined;
    }
    return redirectUri.ports;
}

function requireOAuthField(rawScheme: RawSchemas.OAuthSchemeSchema, field: keyof RawSchemas.OAuthSchemeSchema): string {
    const value = rawScheme[field];
    if (typeof value !== "string") {
        throw new CliError({
            message: `OAuth ${rawScheme.type} flow is missing required field '${field}'`,
            code: CliError.Code.ValidationError
        });
    }
    return value;
}

function generateInferredAuth({
    key,
    file,
    docs,
    rawScheme,
    propertyResolver,
    endpointResolver
}: {
    key: string;
    file: FernFileContext;
    docs: string | undefined;
    rawScheme: RawSchemas.InferredBearerAuthSchema;
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
}): AuthScheme.Inferred {
    return AuthScheme.inferred({
        key,
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
