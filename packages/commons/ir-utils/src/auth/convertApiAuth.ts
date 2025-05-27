import { CasingsGenerator } from "@fern-api/casings-generator";
import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    ApiAuth,
    AuthScheme,
    AuthSchemesRequirement,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    RequestPropertyValue,
    TypeReference,
    OAuthConfiguration
} from "@fern-api/ir-sdk";
import { STRING_TYPE_REFERENCE } from "../utils/constants";

export function convertApiAuth({
    rawApiFileSchema,
    casingsGenerator
}: {
    rawApiFileSchema: RawSchemas.WithAuthSchema;
    casingsGenerator: CasingsGenerator;
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
                casingsGenerator
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
                    casingsGenerator
                })
            )
        })
    });
}

function convertSchemeReference({
    reference,
    authSchemeDeclarations,
    casingsGenerator
}: {
    reference: RawSchemas.AuthSchemeReferenceSchema | string;
    authSchemeDeclarations: Record<string, RawSchemas.AuthSchemeDeclarationSchema> | undefined;
    casingsGenerator: CasingsGenerator;
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
                    name: casingsGenerator.generateNameAndWireValue({
                        name: rawHeader.name ?? reference,
                        wireValue: rawHeader.header
                    }),
                    valueType: TypeReference.primitive({
                        v1: PrimitiveTypeV1.String,
                        v2: PrimitiveTypeV2.string({ default: undefined, validation: undefined })
                    }),
                    prefix: rawHeader.prefix,
                    headerEnvVar: rawHeader.env
                }),
            basic: (rawScheme) =>
                generateBasicAuth({
                    casingsGenerator,
                    docs,
                    rawScheme
                }),
            bearer: (rawScheme) =>
                generateBearerAuth({
                    casingsGenerator,
                    docs,
                    rawScheme
                }),
            oauth: (rawScheme) =>
                generateOauth({
                    casingsGenerator,
                    docs,
                    rawScheme
                })
        });
    };

    const scheme = typeof reference === "string" ? reference : reference.scheme;

    switch (scheme) {
        case "bearer":
            return generateBearerAuth({
                casingsGenerator,
                docs: undefined,
                rawScheme: undefined
            });
        case "basic":
            return generateBasicAuth({
                casingsGenerator,
                docs: undefined,
                rawScheme: undefined
            });
        case "oauth":

        default:
            return convertNamedAuthSchemeReference(scheme, typeof reference !== "string" ? reference.docs : undefined);
    }
}

function generateBearerAuth({
    casingsGenerator,
    docs,
    rawScheme
}: {
    casingsGenerator: CasingsGenerator;
    docs: string | undefined;
    rawScheme: RawSchemas.BearerAuthSchemeSchema | undefined;
}): AuthScheme.Bearer {
    return AuthScheme.bearer({
        docs,
        token: casingsGenerator.generateName(rawScheme?.token?.name ?? "token"),
        tokenEnvVar: rawScheme?.token?.env
    });
}

function generateBasicAuth({
    casingsGenerator,
    docs,
    rawScheme
}: {
    casingsGenerator: CasingsGenerator;
    docs: string | undefined;
    rawScheme: RawSchemas.BasicAuthSchemeSchema | undefined;
}): AuthScheme.Basic {
    return AuthScheme.basic({
        docs,
        username: casingsGenerator.generateName(rawScheme?.username?.name ?? "username"),
        usernameEnvVar: rawScheme?.username?.env,
        password: casingsGenerator.generateName(rawScheme?.password?.name ?? "password"),
        passwordEnvVar: rawScheme?.password?.env
    });
}

function generateOauth({
    casingsGenerator,
    docs,
    rawScheme
}: {
    casingsGenerator: CasingsGenerator;
    docs: string | undefined;
    rawScheme: RawSchemas.OAuthSchemeSchema | undefined;
}): AuthScheme.Oauth {
    return AuthScheme.oauth({
        docs,
        configuration: OAuthConfiguration.clientCredentials({
            clientIdEnvVar: rawScheme?.["client-id-env"],
            clientSecretEnvVar: rawScheme?.["client-secret-env"],
            tokenPrefix: rawScheme?.["token-prefix"],
            tokenHeader: rawScheme?.["token-header"],
            scopes: rawScheme?.scopes,
            tokenEndpoint: {
                requestProperties: {
                    clientId: {
                        propertyPath: undefined,
                        property: RequestPropertyValue.body({
                            name: { wireValue: "client_id", name: casingsGenerator.generateName("client_id") },
                            valueType: STRING_TYPE_REFERENCE,
                            v2Examples: undefined,
                            availability: undefined,
                            docs: undefined,
                            propertyAccess: undefined
                        }),
                    },
                    clientSecret: {
                        propertyPath: undefined,
                        property: RequestPropertyValue.body({
                            name: { wireValue: "client_secret", name: casingsGenerator.generateName("client_secret") },
                            valueType: STRING_TYPE_REFERENCE,
                            v2Examples: undefined,
                            availability: undefined,
                            docs: undefined,
                            propertyAccess: undefined
                        }),
                    },
                    scopes: undefined,
                    customProperties: undefined
                },
                endpointReference: {
                    endpointId: "",
                    serviceId: "",
                    subpackageId: undefined
                },
                responseProperties: {
                    accessToken: {
                        propertyPath: undefined,
                        property: {
                            name: { wireValue: "access_token", name: casingsGenerator.generateName("access_token") },
                            valueType: STRING_TYPE_REFERENCE,
                            v2Examples: undefined,
                            availability: undefined,
                            docs: undefined,
                            propertyAccess: undefined
                        }
                    },
                    expiresIn: undefined,
                    refreshToken: undefined
                }
            },
            refreshEndpoint: rawScheme && rawScheme["refresh-token"] ? (rawScheme["refresh-token"] as any) : undefined
        })
    });
}
