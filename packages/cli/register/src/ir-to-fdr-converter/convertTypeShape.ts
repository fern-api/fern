import { APIV1Write } from "@fern-api/fdr-sdk";
import { FernIr as Ir } from "@fern-fern/ir-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

export function convertTypeShape(irType: Ir.types.Type, ir: IntermediateRepresentation): APIV1Write.TypeShape {
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
                        value: value.name.wireValue
                    })
                )
            };
        },
        object: (object) => {
            return {
                type: "object",
                extends: object.extends,
                properties: object.properties.map(
                    (property): APIV1Write.ObjectProperty => ({
                        description: property.docs ?? undefined,
                        key: property.name.wireValue,
                        valueType: convertTypeReference(property.valueType)
                    })
                )
            };
        },
        union: (union) => {
            const baseProperties = union.baseProperties.map((baseProperty) => {
                return {
                    key: baseProperty.name.wireValue,
                    valueType: convertTypeReference(baseProperty.valueType)
                };
            });
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
                                    extends: [extension],
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
                        typeName:
                            variant.type.type === "named"
                                ? ir.types[variant.type.value]?.name.name.originalName
                                : undefined,
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
        named: (typeId) => {
            return {
                type: "id",
                value: typeId
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
