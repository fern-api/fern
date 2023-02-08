import * as ir from "@fern-fern/ir-model/types";
import { FernApi } from "../generated";
import { convertTypeNameToId } from "./convertTypeNameToId";

export function convertType(irType: ir.TypeDeclaration): FernApi.api.TypeDefinition {
    return ir.Type._visit<FernApi.api.TypeDefinition>(irType.shape, {
        alias: ({ aliasOf }) => FernApi.api.TypeDefinition.alias(convertTypeReference(aliasOf)),
        object: (object) => FernApi.api.TypeDefinition.object(convertObject(object)),
        union: (union) => FernApi.api.TypeDefinition.union(convertUnion(union)),
        enum: (enum_) => FernApi.api.TypeDefinition.enum(convertEnum(enum_)),
        _unknown: () => {
            throw new Error("Unknown Type: " + irType.shape._type);
        },
    });
}

export function convertTypeReference(typeReference: ir.TypeReference): FernApi.api.TypeReference {
    return ir.TypeReference._visit<FernApi.api.TypeReference>(typeReference, {
        container: (containerType) => FernApi.api.TypeReference.container(convertContainerType(containerType)),
        primitive: (primitive) => FernApi.api.TypeReference.primitive(convertPrimitive(primitive)),
        named: (typeName) => FernApi.api.TypeReference.reference(convertTypeNameToId(typeName)),
        unknown: FernApi.api.TypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown TypeReference: " + typeReference._type);
        },
    });
}

function convertContainerType(container: ir.ContainerType): FernApi.api.ContainerType {
    return ir.ContainerType._visit<FernApi.api.ContainerType>(container, {
        list: (itemType) =>
            FernApi.api.ContainerType.list({
                itemType: convertTypeReference(itemType),
            }),
        set: (itemType) =>
            FernApi.api.ContainerType.set({
                itemType: convertTypeReference(itemType),
            }),
        optional: (itemType) =>
            FernApi.api.ContainerType.optional({
                itemType: convertTypeReference(itemType),
            }),
        map: ({ keyType, valueType }) =>
            FernApi.api.ContainerType.map({
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

function convertPrimitive(primitive: ir.PrimitiveType): FernApi.api.PrimitiveType {
    return ir.PrimitiveType._visit<FernApi.api.PrimitiveType>(primitive, {
        string: FernApi.api.PrimitiveType.string,
        integer: FernApi.api.PrimitiveType.integer,
        double: FernApi.api.PrimitiveType.double,
        long: FernApi.api.PrimitiveType.long,
        boolean: FernApi.api.PrimitiveType.boolean,
        dateTime: FernApi.api.PrimitiveType.datetime,
        uuid: FernApi.api.PrimitiveType.uuid,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + primitive);
        },
    });
}

function convertObject(object: ir.ObjectTypeDeclaration): FernApi.api.ObjectType {
    return {
        extends: object.extends.map((extension) => convertTypeNameToId(extension)),
        properties: object.properties.map((property) => convertObjectProperty(property)),
    };
}

function convertObjectProperty(property: ir.ObjectProperty): FernApi.api.ObjectProperty {
    return {
        key: property.name.wireValue,
        value: convertTypeReference(property.valueType),
    };
}

function convertUnion(union: ir.UnionTypeDeclaration): FernApi.api.UnionType {
    return {
        discriminant: union.discriminant.wireValue,
        members: union.types.map((singleUnionType) => ({
            discriminantValue: singleUnionType.discriminantValue.wireValue,
            additionalProperties: ir.SingleUnionTypeProperties._visit<FernApi.api.ObjectType>(singleUnionType.shape, {
                samePropertiesAsObject: (extension) => ({
                    extends: [convertTypeNameToId(extension)],
                    properties: [],
                }),
                singleProperty: (property) => ({
                    extends: [],
                    properties: [
                        {
                            key: property.name.wireValue,
                            value: convertTypeReference(property.type),
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

function convertEnum(enum_: ir.EnumTypeDeclaration): FernApi.api.EnumType {
    return {
        values: enum_.values.map((value) => value.name.wireValue),
    };
}
