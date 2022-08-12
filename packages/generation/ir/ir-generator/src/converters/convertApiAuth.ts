import { RawSchemas, visitRawApiAuth, visitRawAuthSchemeDeclaration } from "@fern-api/yaml-schema";
import {
    ApiAuth,
    AuthSchemeDeclaration,
    AuthSchemeDefinition,
    AuthSchemeName,
    AuthSchemeReference,
    EnabledAuthSchemes,
    FernFilepath,
} from "@fern-fern/ir-model";
import { convertHttpHeader } from "./services/convertHttpService";

export function convertApiAuth({
    rawApiFileSchema,
    fernFilepath,
    imports,
}: {
    rawApiFileSchema: RawSchemas.RootApiFileSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): ApiAuth {
    return {
        docs: undefined,
        declaredSchemes:
            rawApiFileSchema["auth-schemes"] != null
                ? Object.entries(rawApiFileSchema["auth-schemes"]).map(([schemeName, rawSchemeDeclaration]) =>
                      convertSchemeDeclaration({
                          declarationName: schemeName,
                          declaration: rawSchemeDeclaration,
                          fernFilepath,
                          imports,
                      })
                  )
                : [],
        enabledSchemes:
            rawApiFileSchema.auth != null
                ? visitRawApiAuth<EnabledAuthSchemes>(rawApiFileSchema.auth, {
                      single: (authScheme) => EnabledAuthSchemes.all([convertSchemeReference(authScheme)]),
                      all: ({ all }) =>
                          EnabledAuthSchemes.all(all.map((schemeReference) => convertSchemeReference(schemeReference))),
                      any: ({ any }) =>
                          EnabledAuthSchemes.any(any.map((schemeReference) => convertSchemeReference(schemeReference))),
                  })
                : EnabledAuthSchemes.all([]),
    };
}

function convertSchemeDeclaration({
    declarationName,
    declaration,
    fernFilepath,
    imports,
}: {
    declarationName: string;
    declaration: RawSchemas.AuthSchemeDeclarationSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): AuthSchemeDeclaration {
    return {
        docs: declaration.docs,
        name: AuthSchemeName.of(declarationName),
        definition: convertAuthSchemeDefinition(declaration, fernFilepath, imports),
    };
}

function convertAuthSchemeDefinition(
    rawDefinition: RawSchemas.AuthSchemeDeclarationSchema,
    fernFilepath: FernFilepath,
    imports: Record<string, string>
): AuthSchemeDefinition {
    return visitRawAuthSchemeDeclaration(rawDefinition, {
        header: () =>
            AuthSchemeDefinition.header(
                convertHttpHeader({
                    headerKey: rawDefinition.header,
                    header: rawDefinition,
                    fernFilepath,
                    imports,
                })
            ),
    });
}

function convertSchemeReference(reference: RawSchemas.AuthSchemeReferenceSchema | string): AuthSchemeReference {
    if (typeof reference === "string") {
        switch (reference) {
            case "bearer":
                return AuthSchemeReference.bearer({ docs: undefined });
            case "basic":
                return AuthSchemeReference.basic({ docs: undefined });
            default:
                return AuthSchemeReference.named({
                    docs: undefined,
                    name: AuthSchemeName.of(reference),
                });
        }
    }

    switch (reference.scheme) {
        case "bearer":
            return AuthSchemeReference.bearer({ docs: reference.docs });
        case "basic":
            return AuthSchemeReference.basic({ docs: reference.docs });
        default:
            return AuthSchemeReference.named({
                docs: reference.docs,
                name: AuthSchemeName.of(reference.scheme),
            });
    }
}
