import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/yaml-schema";
import { AuthSchemeDeclarationSchema } from "@fern-api/yaml-schema/src/schemas";
import { ApiAuth, AuthScheme, AuthSchemesRequirement, FernFilepath } from "@fern-fern/ir-model";
import { convertHttpHeader } from "./services/convertHttpService";

export function convertApiAuth({
    rawApiFileSchema,
    fernFilepath,
    imports,
}: {
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
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
                    fernFilepath,
                    imports,
                }),
            ],
        }),
        all: ({ all }) => ({
            docs,
            requirement: AuthSchemesRequirement.All,
            schemes: all.map((schemeReference) =>
                convertSchemeReference({
                    reference: schemeReference,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    fernFilepath,
                    imports,
                })
            ),
        }),
        any: ({ any }) => ({
            docs,
            requirement: AuthSchemesRequirement.Any,
            schemes: any.map((schemeReference) =>
                convertSchemeReference({
                    reference: schemeReference,
                    authSchemeDeclarations: rawApiFileSchema["auth-schemes"],
                    fernFilepath,
                    imports,
                })
            ),
        }),
    });
}

function convertSchemeReference({
    reference,
    authSchemeDeclarations,
    fernFilepath,
    imports,
}: {
    reference: RawSchemas.AuthSchemeReferenceSchema | string;
    authSchemeDeclarations: Record<string, AuthSchemeDeclarationSchema> | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): AuthScheme {
    const convertNamedAuthSchemeReference = (reference: string, docs: string | undefined) => {
        const declaration = authSchemeDeclarations?.[reference];
        if (declaration == null) {
            throw new Error("Unknown auth scheme: " + reference);
        }
        return visitRawAuthSchemeDeclaration(declaration, {
            header: (rawHeader) =>
                AuthScheme.header(
                    convertHttpHeader({
                        headerKey: rawHeader.header,
                        header: {
                            docs,
                            name: rawHeader.name,
                            type: rawHeader.type ?? "string",
                        },
                        fernFilepath,
                        imports,
                    })
                ),
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
