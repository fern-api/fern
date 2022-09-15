import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import {
    ResolvedTypeReference,
    ShapeType,
    SingleUnionTypeProperties,
    Type,
    TypeDeclaration,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { FernFileContext } from "../FernFileContext";
import { TypeResolver } from "../type-resolver/TypeResolver";
import { generateWireStringWithAllCasings } from "../utils/generateCasings";
import { getDocs } from "../utils/getDocs";
import { parseTypeName } from "../utils/parseTypeName";

const UNION_VALUE_PROPERTY_NAME = "value";

export function convertTypeDeclaration({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): TypeDeclaration {
    return {
        docs: getDocs(typeDeclaration),
        name: {
            fernFilepath: file.fernFilepath,
            name: typeName,
        },
        shape: convertType({ typeDeclaration, file, typeResolver }),
    };
}

export function convertType({
    typeDeclaration,
    file,
    typeResolver,
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema | string | null | undefined;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Type {
    if (typeDeclaration == null) {
        return Type.alias({
            aliasOf: TypeReference.void(),
            resolvedType: TypeReference.void(),
        });
    }

    return visitRawTypeDeclaration<Type>(typeDeclaration, {
        alias: (alias) => {
            const aliasOfStr = typeof alias === "string" ? alias : alias.alias;
            return Type.alias({
                aliasOf: file.parseTypeReference(aliasOfStr),
                resolvedType: typeResolver.resolveType({ type: aliasOfStr, file }),
            });
        },
        object: (object) =>
            Type.object({
                extends:
                    object.extends != null
                        ? typeof object.extends === "string"
                            ? [parseTypeName({ typeName: object.extends, file })]
                            : object.extends.map((extended) => parseTypeName({ typeName: extended, file }))
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
                              valueType: file.parseTypeReference(propertyDefinition),
                              docs: getDocs(propertyDefinition),
                          }))
                        : [],
            }),
        union: (union) => {
            return Type.union({
                discriminant: union.discriminant ?? "type",
                types: Object.entries(union.union).map(([unionKey, unionedType]) => {
                    const rawType: string | undefined =
                        typeof unionedType === "string"
                            ? unionedType
                            : unionedType.type != null
                            ? unionedType.type
                            : undefined;
                    const valueType = rawType != null ? file.parseTypeReference(rawType) : TypeReference.void();
                    const resolvedType =
                        rawType != null
                            ? typeResolver.resolveType({ type: rawType, file })
                            : ResolvedTypeReference.void();
                    return {
                        discriminantValue: generateWireStringWithAllCasings({
                            wireValue: unionKey,
                            name:
                                typeof unionedType !== "string" && unionedType.name != null
                                    ? unionedType.name
                                    : unionKey,
                        }),
                        valueType,
                        shape:
                            resolvedType._type === "void"
                                ? SingleUnionTypeProperties.noProperties()
                                : resolvedType._type === "named" && resolvedType.shape === ShapeType.Object
                                ? SingleUnionTypeProperties.samePropertiesAsObject(resolvedType.name)
                                : SingleUnionTypeProperties.singleProperty({
                                      name: generateWireStringWithAllCasings({
                                          wireValue: UNION_VALUE_PROPERTY_NAME,
                                          name: UNION_VALUE_PROPERTY_NAME,
                                      }),
                                      type: valueType,
                                  }),
                        docs: getDocs(unionedType),
                    };
                }),
            });
        },
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
