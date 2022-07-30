import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import {
    DeclaredTypeName,
    FernFilepath,
    ObjectProperty,
    Type,
    TypeDeclaration,
    TypeReference,
} from "@fern-fern/ir-model";
import { getDocs } from "../../utils/getDocs";
import { createTypeReferenceParser, TypeReferenceParser } from "../../utils/parseInlineType";
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
                extends: convertExtends({ _extends: object.extends, fernFilepath, imports }),
                properties: convertObjectProperties({ objectProperties: object.properties, parseTypeReference }),
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
                values: _enum.enum.map((value) => ({
                    name: getEnumName(value).name,
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

export function convertExtends({
    _extends,
    fernFilepath,
    imports,
}: {
    _extends: RawSchemas.ObjectExtendsSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): DeclaredTypeName[] {
    if (_extends == null) {
        return [];
    }
    if (typeof _extends === "string") {
        return convertExtends({
            _extends: [_extends],
            fernFilepath,
            imports,
        });
    }
    return _extends.map((extended) => parseTypeName({ typeName: extended, fernFilepath, imports }));
}

export function convertObjectProperties({
    objectProperties,
    parseTypeReference,
}: {
    objectProperties: Record<string, RawSchemas.ObjectPropertySchema> | undefined;
    parseTypeReference: TypeReferenceParser;
}): ObjectProperty[] {
    if (objectProperties == null) {
        return [];
    }
    return Object.entries(objectProperties).map(([propertyName, propertyDefinition]) => ({
        key: propertyName,
        valueType: parseTypeReference(propertyDefinition),
        docs: getDocs(propertyDefinition),
    }));
}
