import { FernFilepath, Type, TypeDefinition } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { DEFAULT_UNION_TYPE_DISCRIMINANT } from "../constants";
import { assertNever } from "../utils/assertNever";
import { getDocs } from "../utils/getDocs";
import { createInlinableTypeParser } from "../utils/parseInlineType";
import { parseTypeName } from "../utils/parseTypeName";

export function convertTypeDefinition({
    typeName,
    typeDefinition,
    fernFilepath,
    imports,
}: {
    typeName: string;
    typeDefinition: RawSchemas.TypeDefinitionSchema;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeDefinition {
    const parseInlinableType = createInlinableTypeParser({ fernFilepath, imports });

    if (isRawAliasDefinition(typeDefinition)) {
        return {
            docs: getDocs(typeDefinition),
            name: {
                fernFilepath,
                name: typeName,
            },
            shape: Type.alias({
                aliasOf: parseInlinableType(typeof typeDefinition === "string" ? typeDefinition : typeDefinition.alias),
                isId: false,
            }),
        };
    }

    if (isRawObjectDefinition(typeDefinition)) {
        return {
            docs: typeDefinition.docs,
            name: {
                fernFilepath,
                name: typeName,
            },
            shape: Type.object({
                extends:
                    typeDefinition.extends != null
                        ? typeof typeDefinition.extends === "string"
                            ? [
                                  parseTypeName({
                                      typeName: typeDefinition.extends,
                                      fernFilepath,
                                      imports,
                                  }),
                              ]
                            : typeDefinition.extends.map((extended) =>
                                  parseTypeName({ typeName: extended, fernFilepath, imports })
                              )
                        : [],
                properties: Object.entries(typeDefinition.fields).map(([fieldName, fieldDefinition]) => ({
                    key: fieldName,
                    valueType: parseInlinableType(fieldDefinition),
                    docs: typeof getDocs(fieldDefinition),
                })),
            }),
        };
    }

    if (isRawUnionDefinition(typeDefinition)) {
        return {
            docs: typeDefinition.docs,
            name: {
                fernFilepath,
                name: typeName,
            },
            shape: Type.union({
                discriminant: typeDefinition.discriminant ?? DEFAULT_UNION_TYPE_DISCRIMINANT,
                types: Object.entries(typeDefinition.union).map(([discriminantValue, unionedType]) => ({
                    discriminantValue,
                    valueType: parseInlinableType(unionedType),
                    docs: getDocs(unionedType),
                })),
            }),
        };
    }

    if (isRawEnumDefinition(typeDefinition)) {
        return {
            docs: typeDefinition.docs,
            name: {
                fernFilepath,
                name: typeName,
            },
            shape: Type.enum({
                values: typeDefinition.enum.map((value) =>
                    typeof value === "string" ? { value, docs: undefined } : { value: value.value, docs: value.docs }
                ),
            }),
        };
    }

    assertNever(typeDefinition);
}

function isRawAliasDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.AliasSchema {
    return typeof rawTypeDefinition === "string" || (rawTypeDefinition as RawSchemas.AliasSchema)?.alias != null;
}

function isRawObjectDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.ObjectSchema {
    return (rawTypeDefinition as RawSchemas.ObjectSchema)?.fields != null;
}

function isRawUnionDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.UnionSchema {
    return (rawTypeDefinition as RawSchemas.UnionSchema)?.union != null;
}

function isRawEnumDefinition(
    rawTypeDefinition: RawSchemas.TypeDefinitionSchema
): rawTypeDefinition is string | RawSchemas.EnumSchema {
    return (rawTypeDefinition as RawSchemas.EnumSchema)?.enum != null;
}
