import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import { ApiAuth, AuthScheme, AuthSchemesRequirement, OAuthConfiguration } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { EndpointResolver } from "../resolvers/EndpointResolver";
import { PropertyResolver } from "../resolvers/PropertyResolver";
import { convertOAuthClientCredentials } from "./convertOAuthClientCredentials";
import { getRefreshTokenEndpoint, getTokenEndpoint } from "./convertOAuthUtils";

export function convertApiAuth({
    rawApiFileSchema,
    file,
    propertyResolver,
    endpointResolver
}: {
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
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
            bearer: (rawScheme) =>
                generateBearerAuth({
                    file,
                    docs,
                    rawScheme
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
    rawScheme: RawSchemas.BearerAuthSchemeSchema | undefined;
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
                        tokenEndpoint: getTokenEndpoint(rawScheme),
                        refreshTokenEndpoint: getRefreshTokenEndpoint(rawScheme)
                    })
                )
            });
        default:
            throw new Error(`Unknown OAuth type: '${rawScheme?.type}'`);
    }
}
