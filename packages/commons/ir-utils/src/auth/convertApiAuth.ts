import { CasingsGenerator } from "@fern-api/casings-generator";
import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    ApiAuth,
    AuthScheme,
    AuthSchemesRequirement,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    TypeReference
} from "@fern-api/ir-sdk";

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
                    key: reference,
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
                    key: reference,
                    casingsGenerator,
                    docs,
                    rawScheme
                }),
            tokenBearer: (rawScheme) =>
                generateBearerAuth({
                    key: reference,
                    casingsGenerator,
                    docs,
                    rawScheme
                }),
            inferredBearer(authScheme) {
                // TODO: implement
                return generateBearerAuth({
                    key: reference,
                    casingsGenerator,
                    docs,
                    rawScheme: undefined
                });
            },
            oauth: (
                rawScheme // TODO: implement
            ) =>
                generateBearerAuth({
                    key: reference,
                    casingsGenerator,
                    docs,
                    rawScheme: undefined
                })
        });
    };

    const scheme = typeof reference === "string" ? reference : reference.scheme;

    switch (scheme) {
        case "bearer":
        case "oauth":
            return generateBearerAuth({
                key: scheme,
                casingsGenerator,
                docs: undefined,
                rawScheme: undefined
            });
        case "basic":
            return generateBasicAuth({
                key: scheme,
                casingsGenerator,
                docs: undefined,
                rawScheme: undefined
            });
        default:
            return convertNamedAuthSchemeReference(scheme, typeof reference !== "string" ? reference.docs : undefined);
    }
}

function generateBearerAuth({
    key,
    casingsGenerator,
    docs,
    rawScheme
}: {
    key: string;
    casingsGenerator: CasingsGenerator;
    docs: string | undefined;
    rawScheme: RawSchemas.TokenBearerAuthSchema | undefined;
}): AuthScheme.Bearer {
    return AuthScheme.bearer({
        key,
        docs,
        token: casingsGenerator.generateName(rawScheme?.token?.name ?? "token"),
        tokenEnvVar: rawScheme?.token?.env
    });
}

function generateBasicAuth({
    key,
    casingsGenerator,
    docs,
    rawScheme
}: {
    key: string;
    casingsGenerator: CasingsGenerator;
    docs: string | undefined;
    rawScheme: RawSchemas.BasicAuthSchemeSchema | undefined;
}): AuthScheme.Basic {
    return AuthScheme.basic({
        key,
        docs,
        username: casingsGenerator.generateName(rawScheme?.username?.name ?? "username"),
        usernameEnvVar: rawScheme?.username?.env,
        password: casingsGenerator.generateName(rawScheme?.password?.name ?? "password"),
        passwordEnvVar: rawScheme?.password?.env
    });
}
