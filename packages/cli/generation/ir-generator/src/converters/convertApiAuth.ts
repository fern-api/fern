import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/yaml-schema";
import { ApiAuth, AuthScheme, AuthSchemesRequirement } from "@fern-fern/ir-model/auth";
import { FernFileContext } from "../FernFileContext";

export function convertApiAuth({
    rawApiFileSchema,
    file,
}: {
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
    file: FernFileContext;
}): ApiAuth {
    if (rawApiFileSchema.auth == null) {
        return {
            docs: undefined,
            requirement: AuthSchemesRequirement.All,
            schemes: [],
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
                    file,
                }),
            ],
        }),
        any: ({ any }) => ({
            docs,
            requirement: AuthSchemesRequirement.Any,
            schemes: any.map((schemeReference) =>
                convertSchemeReference({
                    reference: schemeReference,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    file,
                })
            ),
        }),
    });
}

function convertSchemeReference({
    reference,
    authSchemeDeclarations,
    file,
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
        return visitRawAuthSchemeDeclaration(declaration, {
            header: (rawHeader) =>
                AuthScheme.header({
                    docs,
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: declaration.name ?? reference,
                        wireValue: declaration.header,
                    }),
                    valueType: file.parseTypeReference(rawHeader.type ?? "string"),
                    prefix: rawHeader.prefix,
                }),
        });
    };

    if (typeof reference === "string") {
        switch (reference) {
            case "bearer":
                return AuthScheme.bearer({ docs: undefined });
            case "basic":
                return AuthScheme.basic({ docs: undefined });
            default:
                return convertNamedAuthSchemeReference(reference, undefined);
        }
    }

    switch (reference.scheme) {
        case "bearer":
            return AuthScheme.bearer({ docs: reference.docs });
        case "basic":
            return AuthScheme.basic({ docs: reference.docs });
        default:
            return convertNamedAuthSchemeReference(reference.scheme, reference.docs);
    }
}
