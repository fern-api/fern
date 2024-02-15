import { ApiAuth, AuthScheme, AuthSchemesRequirement } from "@fern-api/ir-sdk";
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
