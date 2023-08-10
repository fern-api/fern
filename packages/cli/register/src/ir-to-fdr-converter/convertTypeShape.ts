import { FernIr as Ir } from "@fern-fern/ir-sdk";
import { FernRegistry } from "@fern-fern/registry-node";

export function convertTypeShape(irType: Ir.types.Type): FernRegistry.api.v1.register.TypeShape {
    return irType._visit<FernRegistry.api.v1.register.TypeShape>({
        alias: (alias) => {
            return FernRegistry.api.v1.register.TypeShape.alias(convertTypeReference(alias.aliasOf));
        },
        enum: (enum_) => {
            return FernRegistry.api.v1.register.TypeShape.enum({
                values: enum_.values.map(
                    (value): FernRegistry.api.v1.register.EnumValue => ({
                        description: value.docs ?? undefined,
                        value: value.name.wireValue,
                    })
                ),
            });
        },
        object: (object) => {
            return FernRegistry.api.v1.register.TypeShape.object({
                extends: object.extends.map((extension) => convertTypeId(extension.typeId)),
                properties: object.properties.map(
                    (property): FernRegistry.api.v1.register.ObjectProperty => ({
                        description: property.docs ?? undefined,
                        key: property.name.wireValue,
                        valueType: convertTypeReference(property.valueType),
                    })
                ),
            });
        },
        union: (union) => {
            return FernRegistry.api.v1.register.TypeShape.discriminatedUnion({
                discriminant: union.discriminant.wireValue,
                variants: union.types.map((variant): FernRegistry.api.v1.register.DiscriminatedUnionVariant => {
                    return {
                        description: variant.docs ?? undefined,
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
                                    _other: () => {
                                        throw new Error(
                                            "Unknown SingleUnionTypeProperties: " + variant.shape.propertiesType
                                        );
                                    },
                                }
                            ),
                    };
                }),
            });
        },
        undiscriminatedUnion: (union) => {
            return FernRegistry.api.v1.register.TypeShape.undiscriminatedUnion({
                variants: union.members.map((variant): FernRegistry.api.v1.register.UndiscriminatedUnionVariant => {
                    return {
                        description: variant.docs ?? undefined,
                        type: convertTypeReference(variant.type),
                    };
                }),
            });
        },
        _other: () => {
            throw new Error("Unknown Type shape: " + irType.type);
        },
    });
}

export function convertTypeReference(
    irTypeReference: Ir.types.TypeReference
): FernRegistry.api.v1.register.TypeReference {
    return irTypeReference._visit<FernRegistry.api.v1.register.TypeReference>({
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
                literal: (literal) => {
                    return Ir.types.Literal._visit(literal, {
                        string: (stringLiteral) =>
                            FernRegistry.api.v1.register.TypeReference.literal(
                                FernRegistry.api.v1.register.LiteralType.stringLiteral(stringLiteral)
                            ),
                        _other: () => {
                            throw new Error("Unknown literal type: " + literal.type);
                        },
                    });
                },
                _other: () => {
                    throw new Error("Unknown container reference: " + container.type);
                },
            });
        },
        named: (name) => {
            return FernRegistry.api.v1.register.TypeReference.id(convertTypeId(name.typeId));
        },
        primitive: (primitive) => {
            switch (primitive) {
                case Ir.types.PrimitiveType.Integer:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.integer()
                    );
                case Ir.types.PrimitiveType.Double:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.double()
                    );
                case Ir.types.PrimitiveType.Long:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.long()
                    );
                case Ir.types.PrimitiveType.String:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.string()
                    );
                case Ir.types.PrimitiveType.Boolean:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.boolean()
                    );
                case Ir.types.PrimitiveType.DateTime:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.datetime()
                    );
                case Ir.types.PrimitiveType.Date:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.date()
                    );
                case Ir.types.PrimitiveType.Base64:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.base64()
                    );
                case Ir.types.PrimitiveType.Uuid:
                    return FernRegistry.api.v1.register.TypeReference.primitive(
                        FernRegistry.api.v1.register.PrimitiveType.uuid()
                    );
            }
        },
        unknown: () => {
            return FernRegistry.api.v1.register.TypeReference.unknown();
        },
        _other: () => {
            throw new Error("Unknown Type reference: " + irTypeReference.type);
        },
    });
}

export function convertTypeId(irTypeId: Ir.commons.TypeId): FernRegistry.api.v1.register.TypeId {
    return FernRegistry.api.v1.register.TypeId(irTypeId);
}
