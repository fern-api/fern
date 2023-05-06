import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";

export function convertTypeShape(irType: Ir.types.Type): FernRegistry.api.v1.register.TypeShape {
    return Ir.types.Type._visit<FernRegistry.api.v1.register.TypeShape>(irType, {
        alias: (alias) => {
            return FernRegistry.api.v1.register.TypeShape.alias(convertTypeReference(alias.aliasOf));
        },
        enum: (enum_) => {
            return FernRegistry.api.v1.register.TypeShape.enum({
                values: enum_.values.map((value) => ({
                    docs: value.docs ?? undefined,
                    value: value.name.wireValue,
                })),
            });
        },
        object: (object) => {
            return FernRegistry.api.v1.register.TypeShape.object({
                extends: object.extends.map((extension) => convertTypeId(extension.typeId)),
                properties: object.properties.map((property) => ({
                    docs: property.docs ?? undefined,
                    key: property.name.wireValue,
                    valueType: convertTypeReference(property.valueType),
                })),
            });
        },
        union: (union) => {
            return FernRegistry.api.v1.register.TypeShape.discriminatedUnion({
                discriminant: union.discriminant.wireValue,
                variants: union.types.map((variant) => {
                    return {
                        docs: variant.docs ?? undefined,
                        discriminantValue: variant.discriminantValue.wireValue,
                        additionalProperties:
                            Ir.types.SingleUnionTypeProperties._visit<FernRegistry.api.v1.register.ObjectType>(
                                variant.shape,
                                {
                                    samePropertiesAsObject: (extension) => ({
                                        extends: [convertTypeId(extension.typeId)],
                                        properties: [],
                                    }),
                                    singleProperty: (singleProperty) => ({
                                        extends: [],
                                        properties: [
                                            {
                                                key: singleProperty.name.wireValue,
                                                valueType: convertTypeReference(singleProperty.type),
                                            },
                                        ],
                                    }),
                                    noProperties: () => ({
                                        extends: [],
                                        properties: [],
                                    }),
                                    _unknown: () => {
                                        throw new Error("Unknown SingleUnionTypeProperties: " + variant.shape._type);
                                    },
                                }
                            ),
                    };
                }),
            });
        },
        undiscriminatedUnion: () => {
            throw new Error("Unsupported union: " + irType._type);
        },
        _unknown: () => {
            throw new Error("Unknown Type shape: " + irType._type);
        },
    });
}

export function convertTypeReference(
    irTypeReference: Ir.types.TypeReference
): FernRegistry.api.v1.register.TypeReference {
    return Ir.types.TypeReference._visit<FernRegistry.api.v1.register.TypeReference>(irTypeReference, {
        container: (container) => {
            return Ir.types.ContainerType._visit<FernRegistry.api.v1.register.TypeReference>(container, {
                list: (itemType) => {
                    return FernRegistry.api.v1.register.TypeReference.list({
                        itemType: convertTypeReference(itemType),
                    });
                },
                map: ({ keyType, valueType }) => {
                    return FernRegistry.api.v1.register.TypeReference.map({
                        keyType: convertTypeReference(keyType),
                        valueType: convertTypeReference(valueType),
                    });
                },
                optional: (itemType) => {
                    return FernRegistry.api.v1.register.TypeReference.optional({
                        itemType: convertTypeReference(itemType),
                    });
                },
                set: (itemType) => {
                    return FernRegistry.api.v1.register.TypeReference.set({
                        itemType: convertTypeReference(itemType),
                    });
                },
                literal: () => {
                    throw new Error("Literals are not supported");
                },
                _unknown: () => {
                    throw new Error("Unknown container reference: " + container._type);
                },
            });
        },
        named: (name) => {
            return FernRegistry.api.v1.register.TypeReference.id(convertTypeId(name.typeId));
        },
        primitive: (primitive) => {
            return FernRegistry.api.v1.register.TypeReference.primitive(
                Ir.types.PrimitiveType._visit<FernRegistry.api.v1.register.PrimitiveType>(primitive, {
                    integer: FernRegistry.api.v1.register.PrimitiveType.integer,
                    double: FernRegistry.api.v1.register.PrimitiveType.double,
                    long: FernRegistry.api.v1.register.PrimitiveType.long,
                    string: FernRegistry.api.v1.register.PrimitiveType.string,
                    boolean: FernRegistry.api.v1.register.PrimitiveType.boolean,
                    dateTime: FernRegistry.api.v1.register.PrimitiveType.datetime,
                    date: FernRegistry.api.v1.register.PrimitiveType.string,
                    base64: FernRegistry.api.v1.register.PrimitiveType.string,
                    uuid: FernRegistry.api.v1.register.PrimitiveType.uuid,
                    _unknown: () => {
                        throw new Error("Unknown primitive: " + primitive);
                    },
                })
            );
        },
        unknown: () => {
            return FernRegistry.api.v1.register.TypeReference.unknown();
        },
        _unknown: () => {
            throw new Error("Unknown Type reference: " + irTypeReference._type);
        },
    });
}

export function convertTypeId(irTypeId: Ir.commons.TypeId): FernRegistry.api.v1.register.TypeId {
    return FernRegistry.api.v1.register.TypeId(irTypeId);
}
