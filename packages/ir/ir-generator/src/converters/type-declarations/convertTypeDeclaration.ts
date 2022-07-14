import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { FernFilepath, Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model";
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
                              key: propertyName,
                              valueType: parseTypeReference(propertyDefinition),
                              docs: getDocs(propertyDefinition),
                          }))
                        : [],
            }),
        union: (union) =>
            Type.union({
                discriminant: union.discriminant ?? "_type",
                types: Object.entries(union.union).map(([discriminantValue, unionedType]) => ({
                    discriminantValue,
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
                values: _enum.enum.map((value) =>
                    typeof value === "string"
                        ? { value, name: value, docs: undefined }
                        : { value: value.value, name: value.name != null ? value.name : value.value, docs: value.docs }
                ),
            }),
    });
}
