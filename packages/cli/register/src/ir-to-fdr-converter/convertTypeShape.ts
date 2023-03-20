import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";

export function convertTypeShape(irType: Ir.types.Type): FernRegistry.TypeShape {
    return Ir.types.Type._visit<FernRegistry.TypeShape>(irType, {
        alias: (alias) => {
            return FernRegistry.TypeShape.alias(convertTypeReference(alias.aliasOf));
        },
        enum: (enum_) => {
            return FernRegistry.TypeShape.enum({
                values: enum_.values.map(
                    (value): FernRegistry.EnumValue => ({
                        description: value.docs ?? undefined,
                        value: value.name.wireValue,
                    })
                ),
            });
        },
        object: (object) => {
            return FernRegistry.TypeShape.object({
                extends: object.extends.map((extension) => convertTypeId(extension.typeId)),
                properties: object.properties.map(
                    (property): FernRegistry.ObjectProperty => ({
                        description: property.docs ?? undefined,
                        key: property.name.wireValue,
                        valueType: convertTypeReference(property.valueType),
                    })
                ),
            });
        },
        union: (union) => {
            return FernRegistry.TypeShape.discriminatedUnion({
                discriminant: union.discriminant.wireValue,
                members: union.types.map((member): FernRegistry.DiscriminatedUnionMember => {
                    return {
                        description: member.docs ?? undefined,
                        discriminantValue: member.discriminantValue.wireValue,
                        additionalProperties: Ir.types.SingleUnionTypeProperties._visit<FernRegistry.ObjectType>(
                            member.shape,
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
                                    throw new Error("Unknown SingleUnionTypeProperties: " + member.shape._type);
                                },
                            }
                        ),
                    };
                }),
            });
        },
        undiscriminatedUnion: (union) => {
            return FernRegistry.TypeShape.undiscriminatedUnion({
                members: union.members.map((member) => ({
                    description: member.docs ?? undefined,
                    type: convertTypeReference(member.type),
                })),
            });
        },
        _unknown: () => {
            throw new Error("Unknown Type shape: " + irType._type);
        },
    });
}

export function convertTypeReference(irTypeReference: Ir.types.TypeReference): FernRegistry.TypeReference {
    return Ir.types.TypeReference._visit<FernRegistry.TypeReference>(irTypeReference, {
        container: (container) => {
            return Ir.types.ContainerType._visit<FernRegistry.TypeReference>(container, {
                list: (itemType) => {
                    return FernRegistry.TypeReference.list({
                        itemType: convertTypeReference(itemType),
                    });
                },
                map: ({ keyType, valueType }) => {
                    return FernRegistry.TypeReference.map({
                        keyType: convertTypeReference(keyType),
                        valueType: convertTypeReference(valueType),
                    });
                },
                optional: (itemType) => {
                    return FernRegistry.TypeReference.optional({
                        itemType: convertTypeReference(itemType),
                    });
                },
                set: (itemType) => {
                    return FernRegistry.TypeReference.set({
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
            return FernRegistry.TypeReference.id(convertTypeId(name.typeId));
        },
        primitive: (primitive) => {
            return FernRegistry.TypeReference.primitive(
                Ir.types.PrimitiveType._visit<FernRegistry.PrimitiveType>(primitive, {
                    integer: FernRegistry.PrimitiveType.integer,
                    double: FernRegistry.PrimitiveType.double,
                    long: FernRegistry.PrimitiveType.long,
                    string: FernRegistry.PrimitiveType.string,
                    boolean: FernRegistry.PrimitiveType.boolean,
                    dateTime: FernRegistry.PrimitiveType.datetime,
                    date: FernRegistry.PrimitiveType.string, // TODO(dsinghvi): FDR to accept Date
                    uuid: FernRegistry.PrimitiveType.uuid,
                    _unknown: () => {
                        throw new Error("Unknown primitive: " + primitive);
                    },
                })
            );
        },
        unknown: () => {
            return FernRegistry.TypeReference.unknown();
        },
        _unknown: () => {
            throw new Error("Unknown Type reference: " + irTypeReference._type);
        },
    });
}

export function convertTypeId(irTypeId: Ir.commons.TypeId): FernRegistry.TypeId {
    return FernRegistry.TypeId(irTypeId);
}
