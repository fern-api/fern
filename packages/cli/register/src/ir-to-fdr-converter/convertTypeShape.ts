import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";

export function convertTypeShape(irType: Ir.types.Type): FernRegistry.Type {
    return Ir.types.Type._visit<FernRegistry.Type>(irType, {
        alias: (alias) => {
            return convertTypeReference(alias.aliasOf);
        },
        enum: (enum_) => {
            return FernRegistry.Type.enum({
                values: enum_.values.map((value) => ({
                    docs: value.docs ?? undefined,
                    value: value.name.wireValue,
                })),
            });
        },
        object: (object) => {
            return FernRegistry.Type.object({
                extends: object.extends.map((extension) => convertTypeId(extension.typeId)),
                properties: object.properties.map((property) => ({
                    docs: property.docs ?? undefined,
                    key: property.name.wireValue,
                    valueType: convertTypeReference(property.valueType),
                })),
            });
        },
        union: (union) => {
            return FernRegistry.Type.discriminatedUnion({
                discriminant: union.discriminant.wireValue,
                members: union.types.map((member) => {
                    return {
                        docs: member.docs ?? undefined,
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
        undiscriminatedUnion: () => {
            throw new Error("Unsupported union: " + irType._type);
        },
        _unknown: () => {
            throw new Error("Unknown Type shape: " + irType._type);
        },
    });
}

export function convertTypeReference(irTypeReference: Ir.types.TypeReference): FernRegistry.Type {
    return Ir.types.TypeReference._visit<FernRegistry.Type>(irTypeReference, {
        container: (container) => {
            return Ir.types.ContainerType._visit<FernRegistry.Type>(container, {
                list: (itemType) => {
                    return FernRegistry.Type.list({
                        itemType: convertTypeReference(itemType),
                    });
                },
                map: ({ keyType, valueType }) => {
                    return FernRegistry.Type.map({
                        keyType: convertTypeReference(keyType),
                        valueType: convertTypeReference(valueType),
                    });
                },
                optional: (itemType) => {
                    return FernRegistry.Type.optional({
                        itemType: convertTypeReference(itemType),
                    });
                },
                set: (itemType) => {
                    return FernRegistry.Type.set({
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
            return FernRegistry.Type.reference(convertTypeId(name.typeId));
        },
        primitive: (primitive) => {
            return FernRegistry.Type.primitive(
                Ir.types.PrimitiveType._visit<FernRegistry.PrimitiveType>(primitive, {
                    integer: FernRegistry.PrimitiveType.integer,
                    double: FernRegistry.PrimitiveType.double,
                    long: FernRegistry.PrimitiveType.long,
                    string: FernRegistry.PrimitiveType.string,
                    boolean: FernRegistry.PrimitiveType.boolean,
                    dateTime: FernRegistry.PrimitiveType.datetime,
                    date: FernRegistry.PrimitiveType.string, // TODO(dsinghvi): FDR to accept Date
                    binary: FernRegistry.PrimitiveType.string, // TODO(dsinghvi): FDR to accept Date
                    uuid: FernRegistry.PrimitiveType.uuid,
                    _unknown: () => {
                        throw new Error("Unknown primitive: " + primitive);
                    },
                })
            );
        },
        unknown: () => {
            return FernRegistry.Type.unknown();
        },
        _unknown: () => {
            throw new Error("Unknown Type reference: " + irTypeReference._type);
        },
    });
}

export function convertTypeId(irTypeId: Ir.commons.TypeId): FernRegistry.TypeId {
    return FernRegistry.TypeId(irTypeId);
}
