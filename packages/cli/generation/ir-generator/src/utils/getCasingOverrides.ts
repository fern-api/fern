import { RawSchemas } from "@fern-api/fern-definition-schema";

export function getCasingOverrides(
    typeDeclaration: string | { name?: RawSchemas.TypeDeclarationName }
): RawSchemas.CasingOverridesSchema | undefined {
    if (
        typeof typeDeclaration === "string" ||
        typeDeclaration.name == null ||
        typeof typeDeclaration.name === "string"
    ) {
        return undefined;
    }
    return typeDeclaration.name.casing;
}
