import { FernFilepath, Type, TypeDeclaration, TypeReference } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { parseTypeName } from "../../utils/parseTypeName";
import { isRawAliasDefinition, isRawEnumDefinition, isRawObjectDefinition, isRawUnionDefinition } from "./utils";

export function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    fernFilepath,
    imports,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): TypeDeclaration {
    return {
        docs: getDocs(typeDeclaration),
        name: {
            fernFilepath,
            name: typeName,
        },
        shape: convertType({ typeDeclaration, fernFilepath, imports }),
    };
}

export function convertType({
    typeDeclaration,
    fernFilepath,
    imports,
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string | null | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): Type {
    if (typeDeclaration == null) {
        return Type.alias({ aliasOf: TypeReference.void() });
    }
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    if (typeof typeDeclaration === "string" || isRawAliasDefinition(typeDeclaration)) {
        return Type.alias({
            aliasOf: parseTypeReference(typeof typeDeclaration === "string" ? typeDeclaration : typeDeclaration.alias),
        });
    }

    if (isRawObjectDefinition(typeDeclaration)) {
        return Type.object({
            extends:
                typeDeclaration.extends != null
                    ? typeof typeDeclaration.extends === "string"
                        ? [
                              parseTypeName({
                                  typeName: typeDeclaration.extends,
                                  fernFilepath,
                                  imports,
                              }),
                          ]
                        : typeDeclaration.extends.map((extended) =>
                              parseTypeName({ typeName: extended, fernFilepath, imports })
                          )
                    : [],
            properties: [
                ...Object.entries(typeDeclaration.properties).map(([propertyName, propertyDefinition]) => ({
                    key: propertyName,
                    valueType: parseTypeReference(propertyDefinition),
                    docs: getDocs(propertyDefinition),
                })),
            ],
        });
    }

    if (isRawUnionDefinition(typeDeclaration)) {
        return Type.union({
            discriminant: typeDeclaration.discriminant ?? "_type",
            types: Object.entries(typeDeclaration.union).map(([discriminantValue, unionedType]) => ({
                discriminantValue,
                valueType: parseTypeReference(unionedType),
                docs: getDocs(unionedType),
            })),
        });
    }

    if (isRawEnumDefinition(typeDeclaration)) {
        return Type.enum({
            values: typeDeclaration.enum.map((value) =>
                typeof value === "string"
                    ? { value, name: value, docs: undefined }
                    : { value: value.value, name: value.name != null ? value.name : value.value, docs: value.docs }
            ),
        });
    }

    assertNever(typeDeclaration);
}
