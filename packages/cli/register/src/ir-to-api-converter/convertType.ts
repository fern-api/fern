import * as ir from "@fern-fern/ir-model/types";
import { FernRegistry } from "@fern-fern/registry";
import { convertTypeNameToId } from "./convertTypeNameToId";

export function convertType(irType: ir.TypeDeclaration): FernRegistry.TypeDefinition {
    return ir.Type._visit<FernRegistry.TypeDefinition>(irType.shape, {
        alias: ({ aliasOf }) => FernRegistry.TypeDefinition.alias(convertTypeReference(aliasOf)),
        object: (object) => FernRegistry.TypeDefinition.object(convertObject(object)),
        union: (union) => FernRegistry.TypeDefinition.union(convertUnion(union)),
        enum: (enum_) => FernRegistry.TypeDefinition.enum(convertEnum(enum_)),
        _unknown: () => {
            throw new Error("Unknown Type: " + irType.shape._type);
        },
    });
}

export function convertTypeReference(typeReference: ir.TypeReference): FernRegistry.TypeReference {
    return ir.TypeReference._visit<FernRegistry.TypeReference>(typeReference, {
        container: (containerType) => FernRegistry.TypeReference.container(convertContainerType(containerType)),
        primitive: (primitive) => FernRegistry.TypeReference.primitive(convertPrimitive(primitive)),
        named: (typeName) => FernRegistry.TypeReference.reference(convertTypeNameToId(typeName)),
        unknown: FernRegistry.TypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        },
    });
}

function convertContainerType(container: ir.ContainerType): FernRegistry.ContainerType {
    return ir.ContainerType._visit<FernRegistry.ContainerType>(container, {
        list: (itemType) =>
            FernRegistry.ContainerType.list({
                itemType: convertTypeReference(itemType),
            }),
        set: (itemType) =>
            FernRegistry.ContainerType.set({
                itemType: convertTypeReference(itemType),
            }),
        optional: (itemType) =>
            FernRegistry.ContainerType.optional({
                itemType: convertTypeReference(itemType),
            }),
        map: ({ keyType, valueType }) =>
            FernRegistry.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType),
            }),
        literal: () => {
            throw new Error("Literals are not supported");
        },
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + container._type);
        },
    });
}

function convertPrimitive(primitive: ir.PrimitiveType): FernRegistry.PrimitiveType {
    return ir.PrimitiveType._visit<FernRegistry.PrimitiveType>(primitive, {
        string: FernRegistry.PrimitiveType.string,
        integer: FernRegistry.PrimitiveType.integer,
        double: FernRegistry.PrimitiveType.double,
        long: FernRegistry.PrimitiveType.long,
        boolean: FernRegistry.PrimitiveType.boolean,
        dateTime: FernRegistry.PrimitiveType.datetime,
        uuid: FernRegistry.PrimitiveType.uuid,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + primitive);
        },
    });
}

function convertObject(object: ir.ObjectTypeDeclaration): FernRegistry.ObjectType {
    return {
        extends: object.extends.map((extension) => convertTypeNameToId(extension)),
        properties: object.properties.map((property) => convertObjectProperty(property)),
    };
}

function convertObjectProperty(property: ir.ObjectProperty): FernRegistry.ObjectProperty {
    return {
        key: property.name.wireValue,
        valueType: convertTypeReference(property.valueType),
    };
}

function convertUnion(union: ir.UnionTypeDeclaration): FernRegistry.UnionType {
    return {
        discriminant: union.discriminant.wireValue,
        members: union.types.map((singleUnionType) => ({
            discriminantValue: singleUnionType.discriminantValue.wireValue,
            additionalProperties: ir.SingleUnionTypeProperties._visit<FernRegistry.ObjectType>(singleUnionType.shape, {
                samePropertiesAsObject: (extension) => ({
                    extends: [convertTypeNameToId(extension)],
                    properties: [],
                }),
                singleProperty: (property) => ({
                    extends: [],
                    properties: [
                        {
                            key: property.name.wireValue,
                            valueType: convertTypeReference(property.type),
                        },
                    ],
                }),
                noProperties: () => ({
                    extends: [],
                    properties: [],
                }),
                _unknown: () => {
                    throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape._type);
                },
            }),
        })),
    };
}

function convertEnum(enum_: ir.EnumTypeDeclaration): FernRegistry.EnumType {
    return {
        values: enum_.values.map((value) => value.name.wireValue),
    };
}
