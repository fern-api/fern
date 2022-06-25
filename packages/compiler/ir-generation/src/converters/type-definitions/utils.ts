import { RawSchemas } from "@fern-api/syntax-analysis";

export function isRawAliasDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.AliasSchema {
    return (rawTypeDeclaration as RawSchemas.AliasSchema)?.alias != null;
}

export function isRawObjectDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.ObjectSchema {
    return (rawTypeDeclaration as RawSchemas.ObjectSchema)?.properties != null;
}

export function isRawUnionDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.UnionSchema {
    return (rawTypeDeclaration as RawSchemas.UnionSchema)?.union != null;
}

export function isRawEnumDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.EnumSchema {
    return (rawTypeDeclaration as RawSchemas.EnumSchema)?.enum != null;
}
