import { RawSchemas } from "@fern-api/yaml-schema";

export function isRawAliasDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.AliasSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawTypeDeclaration as RawSchemas.AliasSchema).alias != null;
}

export function isRawObjectDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.ObjectSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawTypeDeclaration as RawSchemas.ObjectSchema).properties != null;
}

export function isRawUnionDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.UnionSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawTypeDeclaration as RawSchemas.UnionSchema).union != null;
}

export function isRawEnumDefinition(
    rawTypeDeclaration: RawSchemas.TypeDeclarationSchema
): rawTypeDeclaration is RawSchemas.EnumSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawTypeDeclaration as RawSchemas.EnumSchema).enum != null;
}
