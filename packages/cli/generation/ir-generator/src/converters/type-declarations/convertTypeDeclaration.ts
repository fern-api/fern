import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { generateWireStringWithAllCasings } from "../../utils/generateCasings";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser } from "../../utils/parseInlineType";
import { parseTypeName } from "../../utils/parseTypeName";

export function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    fernFilepath,
    imports,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
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
    imports: Record<string, RelativeFilePath>;
}): Type {
    if (typeDeclaration == null) {
        return Type.alias({ aliasOf: TypeReference.void() });
    }
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return visitRawTypeDeclaration<Type>(typeDeclaration, {
        alias: (alias) =>
            Type.alias({
                aliasOf: parseTypeReference(typeof alias === "string" ? alias : alias.alias),
            }),
        object: (object) =>
            Type.object({
                extends:
                    object.extends != null
                        ? typeof object.extends === "string"
                            ? [
                                  parseTypeName({
                                      typeName: object.extends,
                                      fernFilepath,
                                      imports,
                                  }),
                              ]
                            : object.extends.map((extended) =>
                                  parseTypeName({ typeName: extended, fernFilepath, imports })
                              )
                        : [],
                properties:
                    object.properties != null
                        ? Object.entries(object.properties).map(([propertyName, propertyDefinition]) => ({
                              name: generateWireStringWithAllCasings({
                                  wireValue: propertyName,
                                  name:
                                      typeof propertyDefinition !== "string" && propertyDefinition.name
                                          ? propertyDefinition.name
                                          : propertyName,
                              }),
                              valueType: parseTypeReference(propertyDefinition),
                              docs: getDocs(propertyDefinition),
                          }))
                        : [],
            }),
        union: (union) =>
            Type.union({
                discriminant: union.discriminant ?? "type",
                types: Object.entries(union.union).map(([unionKey, unionedType]) => ({
                    discriminantValue: generateWireStringWithAllCasings({
                        wireValue: unionKey,
                        name: typeof unionedType !== "string" && unionedType.name != null ? unionedType.name : unionKey,
                    }),
                    valueType:
                        typeof unionedType === "string"
                            ? parseTypeReference(unionedType)
                            : unionedType.type == null
                            ? TypeReference.void()
                            : parseTypeReference({
                                  ...unionedType,
                                  type: unionedType.type,
                              }),
                    docs: getDocs(unionedType),
                })),
            }),
        enum: (_enum) =>
            Type.enum({
                values: _enum.enum.map((value) => ({
                    name: generateWireStringWithAllCasings({
                        wireValue: typeof value === "string" ? value : value.value,
                        name: getEnumName(value).name,
                    }),
                    value: typeof value === "string" ? value : value.value,
                    docs: typeof value !== "string" ? value.docs : undefined,
                })),
            }),
    });
}

export function getEnumName(enumValue: RawSchemas.EnumValueSchema): { name: string; wasExplicitlySet: boolean } {
    if (typeof enumValue === "string") {
        return {
            name: enumValue,
            wasExplicitlySet: false,
        };
    }

    if (enumValue.name == null) {
        return {
            name: enumValue.value,
            wasExplicitlySet: false,
        };
    }

    return {
        name: enumValue.name,
        wasExplicitlySet: true,
    };
}
