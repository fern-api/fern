import { RawSchemas } from "@fern-api/fern-definition-schema";

export function getTypeDeclarationName(
    typeDeclaration: string | { name?: RawSchemas.TypeDeclarationName }
): string | undefined;
export function getTypeDeclarationName(
    typeDeclaration: string | { name?: RawSchemas.TypeDeclarationName },
    fallback: string
): string;
export function getTypeDeclarationName(
    typeDeclaration: string | { name?: RawSchemas.TypeDeclarationName },
    fallback?: string | undefined
): string | undefined {
    if (typeof typeDeclaration === "string") {
        return fallback;
    }
    if(typeDeclaration.name == null){
        return fallback;
    }
    if (typeof typeDeclaration.name === "string") {
        return typeDeclaration.name;
    }
    if (typeDeclaration.name.value == null) {
        return fallback;
    }
    if (typeof typeDeclaration.name.value === "string") {
        return typeDeclaration.name.value;
    }
    return fallback;
}
