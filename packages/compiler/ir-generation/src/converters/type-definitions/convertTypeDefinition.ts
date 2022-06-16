import { FernFilepath, Type, TypeDefinition, TypeReference } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { parseTypeName } from "../../utils/parseTypeName";
import { isRawAliasDefinition, isRawEnumDefinition, isRawObjectDefinition, isRawUnionDefinition } from "./utils";

export function convertTypeDefinition({
    typeName,
    typeDefinition,
    fernFilepath,
    imports,
}: {
    typeName: string;
    typeDefinition: RawSchemas.TypeDefinitionSchema | string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeDefinition {
    return {
        docs: getDocs(typeDefinition),
        name: {
            fernFilepath,
            name: typeName,
        },
        shape: convertType({ typeDefinition, fernFilepath, imports }),
    };
}

export function convertType({
    typeDefinition,
    fernFilepath,
    imports,
}: {
    typeDefinition: RawSchemas.TypeDefinitionSchema | string | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): Type {
    if (typeDefinition == null) {
        return Type.alias({ aliasOf: TypeReference.void() });
    }
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    if (typeof typeDefinition === "string" || isRawAliasDefinition(typeDefinition)) {
        return Type.alias({
            aliasOf: parseTypeReference(typeof typeDefinition === "string" ? typeDefinition : typeDefinition.alias),
        });
    }

    if (isRawObjectDefinition(typeDefinition)) {
        return Type.object({
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
            properties: [
                ...Object.entries(typeDefinition.properties).map(([propertyName, propertyDefinition]) => ({
                    key: propertyName,
                    valueType: parseTypeReference(propertyDefinition),
                    docs: getDocs(propertyDefinition),
                })),
            ],
        });
    }

    if (isRawUnionDefinition(typeDefinition)) {
        return Type.union({
            discriminant: typeDefinition.discriminant ?? "_type",
            types: Object.entries(typeDefinition.union).map(([discriminantValue, unionedType]) => ({
                discriminantValue,
                valueType: parseTypeReference(unionedType),
                docs: getDocs(unionedType),
            })),
        });
    }

    if (isRawEnumDefinition(typeDefinition)) {
        return Type.enum({
            values: typeDefinition.enum.map((value) =>
                typeof value === "string"
                    ? { value, name: value, docs: undefined }
                    : { value: value.value, name: value.name != null ? value.name : value.value, docs: value.docs }
            ),
        });
    }

    assertNever(typeDefinition);
}
