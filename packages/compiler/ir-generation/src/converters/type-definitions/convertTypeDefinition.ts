import { FernFilepath, Type, TypeDefinition } from "@fern-api/api";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { DEFAULT_UNION_TYPE_DISCRIMINANT } from "../../constants";
import { assertNever } from "../../utils/assertNever";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { parseTypeName } from "../../utils/parseTypeName";
import { isRawAliasDefinition, isRawEnumDefinition, isRawObjectDefinition, isRawUnionDefinition } from "./util";

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
    typeDefinition: RawSchemas.TypeDefinitionSchema | string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): Type {
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
            properties: Object.entries(typeDefinition.fields).map(([fieldName, fieldDefinition]) => ({
                key: fieldName,
                valueType: parseTypeReference(fieldDefinition),
                docs: typeof getDocs(fieldDefinition),
            })),
        });
    }

    if (isRawUnionDefinition(typeDefinition)) {
        return Type.union({
            discriminant: typeDefinition.discriminant ?? DEFAULT_UNION_TYPE_DISCRIMINANT,
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
                typeof value === "string" ? { value, docs: undefined } : { value: value.value, docs: value.docs }
            ),
        });
    }

    assertNever(typeDefinition);
}
