import { APIV1Write } from "@fern-api/fdr-sdk";
import { FernIr as Ir } from "@fern-fern/ir-sdk";
import { convertIrAvailability } from "./convertPackage";

export function convertTypeShape(irType: Ir.types.Type): APIV1Write.TypeShape {
    return irType._visit<APIV1Write.TypeShape>({
        alias: (alias) => {
            return {
                type: "alias",
                value: convertTypeReference(alias.aliasOf)
            };
        },
        enum: (enum_) => {
            return {
                type: "enum",
                values: enum_.values.map(
                    (value): APIV1Write.EnumValue => ({
                        description: value.docs ?? undefined,
                        value: value.name.wireValue,
                        availability:
                            value.availability != null
                                ? convertIrAvailability({ availability: value.availability })
                                : undefined
                    })
                )
            };
        },
        object: (object) => {
            return {
                type: "object",
                extends: object.extends.map((extension) => extension.typeId),
                properties: object.properties.map(
                    (property): APIV1Write.ObjectProperty => ({
                        description: property.docs ?? undefined,
                        key: property.name.wireValue,
                        valueType: convertTypeReference(property.valueType),
                        availability:
                            property.availability != null
                                ? convertIrAvailability({ availability: property.availability })
                                : undefined
                    })
                )
            };
        },
        union: (union) => {
            const baseProperties: APIV1Write.ObjectProperty[] = union.baseProperties.map(
                (baseProperty): APIV1Write.ObjectProperty => {
                    return {
                        key: baseProperty.name.wireValue,
                        valueType: convertTypeReference(baseProperty.valueType),
                        availability:
                            baseProperty.availability != null
                                ? convertIrAvailability({ availability: baseProperty.availability })
                                : undefined,
                        description: baseProperty.docs
                    };
                }
            );
            return {
                type: "discriminatedUnion",
                discriminant: union.discriminant.wireValue,
                variants: union.types.map((variant): APIV1Write.DiscriminatedUnionVariant => {
                    return {
                        description: variant.docs ?? undefined,
                        discriminantValue: variant.discriminantValue.wireValue,
                        additionalProperties: Ir.types.SingleUnionTypeProperties._visit<APIV1Write.ObjectType>(
                            variant.shape,
                            {
                                samePropertiesAsObject: (extension) => ({
                                    extends: [extension.typeId],
                                    properties: baseProperties
                                }),
                                singleProperty: (singleProperty) => ({
                                    extends: [],
                                    properties: [
                                        {
                                            key: singleProperty.name.wireValue,
                                            valueType: convertTypeReference(singleProperty.type)
                                        },
                                        ...baseProperties
                                    ]
                                }),
                                noProperties: () => ({
                                    extends: [],
                                    properties: baseProperties
                                }),
                                _other: () => {
                                    throw new Error(
                                        "Unknown SingleUnionTypeProperties: " + variant.shape.propertiesType
                                    );
                                }
                            }
                        )
                    };
                })
            };
        },
        undiscriminatedUnion: (union) => {
            return {
                type: "undiscriminatedUnion",
                variants: union.members.map((variant): APIV1Write.UndiscriminatedUnionVariant => {
                    return {
                        typeName: variant.type.type === "named" ? variant.type.name.originalName : undefined,
                        description: variant.docs ?? undefined,
                        type: convertTypeReference(variant.type)
                    };
                })
            };
        },
        _other: () => {
            throw new Error("Unknown Type shape: " + irType.type);
        }
    });
}

export function convertTypeReference(irTypeReference: Ir.types.TypeReference): APIV1Write.TypeReference {
    return irTypeReference._visit<APIV1Write.TypeReference>({
        container: (container) => {
            return Ir.types.ContainerType._visit<APIV1Write.TypeReference>(container, {
                list: (itemType) => {
                    return {
                        type: "list",
                        itemType: convertTypeReference(itemType)
                    };
                },
                map: ({ keyType, valueType }) => {
                    return {
                        type: "map",
                        keyType: convertTypeReference(keyType),
                        valueType: convertTypeReference(valueType)
                    };
                },
                optional: (itemType) => {
                    return {
                        type: "optional",
                        itemType: convertTypeReference(itemType)
                    };
                },
                set: (itemType) => {
                    return {
                        type: "set",
                        itemType: convertTypeReference(itemType)
                    };
                },
                literal: (literal) => {
                    return Ir.types.Literal._visit<APIV1Write.TypeReference>(literal, {
                        boolean: (booleanLiteral) => {
                            return {
                                type: "literal",
                                value: {
                                    type: "booleanLiteral",
                                    value: booleanLiteral
                                }
                            };
                        },
                        string: (stringLiteral) => {
                            return {
                                type: "literal",
                                value: {
                                    type: "stringLiteral",
                                    value: stringLiteral
                                }
                            };
                        },
                        _other: () => {
                            throw new Error("Unknown literal type: " + literal.type);
                        }
                    });
                },
                _other: () => {
                    throw new Error("Unknown container reference: " + container.type);
                }
            });
        },
        named: (name) => {
            return {
                type: "id",
                value: name.typeId
            };
        },
        primitive: (primitive) => {
            return {
                type: "primitive",
                value: Ir.types.PrimitiveType._visit<APIV1Write.PrimitiveType>(primitive, {
                    integer: () => {
                        return {
                            type: "integer"
                        };
                    },
                    double: () => {
                        return {
                            type: "double"
                        };
                    },
                    string: () => {
                        return {
                            type: "string"
                        };
                    },
                    long: () => {
                        return {
                            type: "long"
                        };
                    },
                    boolean: () => {
                        return {
                            type: "boolean"
                        };
                    },
                    dateTime: () => {
                        return {
                            type: "datetime"
                        };
                    },
                    date: () => {
                        return {
                            type: "date"
                        };
                    },
                    uuid: () => {
                        return {
                            type: "uuid"
                        };
                    },
                    base64: () => {
                        return {
                            type: "base64"
                        };
                    },
                    _other: () => {
                        throw new Error("Unknown primitive: " + primitive);
                    }
                })
            };
        },
        unknown: () => {
            return {
                type: "unknown"
            };
        },
        _other: () => {
            throw new Error("Unknown Type reference: " + irTypeReference.type);
        }
    });
}
