import { FernIr as Ir, TypeReference } from "@fern-api/ir-sdk";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

import { convertIrAvailability } from "./convertPackage";

export function convertTypeShape(irType: Ir.types.Type): FdrCjsSdk.api.v1.register.TypeShape {
    return irType._visit<FdrCjsSdk.api.v1.register.TypeShape>({
        alias: (alias) => {
            return {
                type: "alias",
                value: convertTypeReference(alias.aliasOf)
            };
        },
        enum: (enum_) => {
            return {
                type: "enum",
                default: enum_.default != null ? enum_.default.name.wireValue : undefined,
                values: enum_.values.map(
                    (value): FdrCjsSdk.api.v1.register.EnumValue => ({
                        description: value.docs ?? undefined,
                        value: value.name.wireValue,
                        availability: convertIrAvailability(value.availability)
                    })
                )
            };
        },
        object: (object) => {
            return {
                type: "object",
                extends: object.extends.map((extension) => FdrCjsSdk.TypeId(extension.typeId)),
                properties: object.properties.map(
                    (property): FdrCjsSdk.api.v1.register.ObjectProperty => ({
                        description: property.docs ?? undefined,
                        key: FdrCjsSdk.PropertyKey(property.name.wireValue),
                        valueType: convertTypeReference(property.valueType),
                        availability: convertIrAvailability(property.availability)
                    })
                ),
                extraProperties: convertExtraProperties(object.extraProperties)
            };
        },
        union: (union) => {
            const baseProperties: FdrCjsSdk.api.v1.register.ObjectProperty[] = union.baseProperties.map(
                (baseProperty): FdrCjsSdk.api.v1.register.ObjectProperty => {
                    return {
                        key: FdrCjsSdk.PropertyKey(baseProperty.name.wireValue),
                        valueType: convertTypeReference(baseProperty.valueType),
                        availability: convertIrAvailability(baseProperty.availability),
                        description: baseProperty.docs
                    };
                }
            );
            return {
                type: "discriminatedUnion",
                discriminant: union.discriminant.wireValue,
                variants: union.types.map((variant): FdrCjsSdk.api.v1.register.DiscriminatedUnionVariant => {
                    return {
                        description: variant.docs ?? undefined,
                        discriminantValue: variant.discriminantValue.wireValue,
                        displayName: variant.displayName,
                        availability:
                            variant.availability != null ? convertIrAvailability(variant.availability) : undefined,
                        additionalProperties:
                            Ir.types.SingleUnionTypeProperties._visit<FdrCjsSdk.api.v1.register.ObjectType>(
                                variant.shape,
                                {
                                    samePropertiesAsObject: (extension) => ({
                                        extends: [FdrCjsSdk.TypeId(extension.typeId)],
                                        properties: baseProperties,
                                        // TODO: add support for extra properties in discriminated union
                                        extraProperties: undefined
                                    }),
                                    singleProperty: (singleProperty) => ({
                                        extends: [],
                                        properties: [
                                            {
                                                key: FdrCjsSdk.PropertyKey(singleProperty.name.wireValue),
                                                valueType: convertTypeReference(singleProperty.type),
                                                description: undefined,
                                                availability: undefined
                                            },
                                            ...baseProperties
                                        ],
                                        // TODO: add support for extra properties in discriminated union
                                        extraProperties: undefined
                                    }),
                                    noProperties: () => ({
                                        extends: [],
                                        properties: baseProperties,
                                        // TODO: add support for extra properties in discriminated union
                                        extraProperties: undefined
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
                variants: union.members.map((variant): FdrCjsSdk.api.v1.register.UndiscriminatedUnionVariant => {
                    return {
                        typeName: variant.type.type === "named" ? variant.type.name.originalName : undefined,
                        description: variant.docs ?? undefined,
                        type: convertTypeReference(variant.type),
                        availability: undefined
                    };
                })
            };
        },
        _other: () => {
            throw new Error("Unknown Type shape: " + irType.type);
        }
    });
}

export function convertTypeReference(irTypeReference: Ir.types.TypeReference): FdrCjsSdk.api.v1.register.TypeReference {
    return irTypeReference._visit<FdrCjsSdk.api.v1.register.TypeReference>({
        container: (container) => {
            return Ir.types.ContainerType._visit<FdrCjsSdk.api.v1.register.TypeReference>(container, {
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
                        itemType: convertTypeReference(itemType),
                        defaultValue: undefined
                    };
                },
                set: (itemType) => {
                    return {
                        type: "set",
                        itemType: convertTypeReference(itemType)
                    };
                },
                literal: (literal) => {
                    return Ir.types.Literal._visit<FdrCjsSdk.api.v1.register.TypeReference>(literal, {
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
                value: FdrCjsSdk.TypeId(name.typeId),
                default: undefined
            };
        },
        primitive: (primitive) => {
            return {
                type: "primitive",
                value: Ir.types.PrimitiveTypeV1._visit<FdrCjsSdk.api.v1.register.PrimitiveType>(primitive.v1, {
                    integer: () => {
                        return convertInteger(primitive.v2);
                    },
                    float: () => {
                        // TODO: Add support for float types in FDR. We render them as double for now
                        // (they have the same JSON representation).
                        return convertDouble(primitive.v2);
                    },
                    double: () => {
                        return convertDouble(primitive.v2);
                    },
                    string: () => {
                        return convertString(primitive.v2);
                    },
                    long: () => {
                        return {
                            type: "long",
                            default: primitive.v2?.type === "long" ? primitive.v2.default : undefined,
                            minimum: undefined,
                            maximum: undefined
                        };
                    },
                    boolean: () => {
                        return {
                            type: "boolean",
                            default: primitive.v2?.type === "boolean" ? primitive.v2.default : undefined
                        };
                    },
                    dateTime: () => {
                        return {
                            type: "datetime",
                            default: undefined
                        };
                    },
                    date: () => {
                        return {
                            type: "date",
                            default: undefined
                        };
                    },
                    uuid: () => {
                        return {
                            type: "uuid",
                            default: undefined
                        };
                    },
                    base64: () => {
                        return {
                            type: "base64",
                            default: undefined
                        };
                    },
                    bigInteger: () => {
                        return {
                            type: "bigInteger",
                            default: primitive.v2?.type === "bigInteger" ? primitive.v2.default : undefined
                        };
                    },
                    uint: () => {
                        return {
                            type: "uint"
                        };
                    },
                    uint64: () => {
                        return {
                            type: "uint64"
                        };
                    },
                    _other: () => {
                        throw new Error("Unknown primitive: " + primitive.v1);
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

function convertString(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.StringValidationRules | undefined =
        primitive != null && primitive.type === "string" ? primitive.validation : undefined;
    return {
        type: "string",
        regex: rules != null ? rules.pattern : undefined,
        minLength: rules != null ? rules.minLength : undefined,
        maxLength: rules != null ? rules.maxLength : undefined,
        default: primitive != null && primitive.type === "string" ? primitive.default : undefined
    };
}

function convertInteger(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.IntegerValidationRules | undefined =
        primitive != null && primitive.type === "integer" ? primitive.validation : undefined;
    return {
        type: "integer",
        minimum: rules != null ? rules.min : undefined,
        maximum: rules != null ? rules.max : undefined,
        default: primitive != null && primitive.type === "integer" ? primitive.default : undefined
    };
}

function convertDouble(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.DoubleValidationRules | undefined =
        primitive != null && primitive.type === "double" ? primitive.validation : undefined;
    return {
        type: "double",
        minimum: rules != null ? rules.min : undefined,
        maximum: rules != null ? rules.max : undefined,
        default: primitive != null && primitive.type === "double" ? primitive.default : undefined
    };
}

function convertExtraProperties(
    extraProperties: boolean | string | Ir.types.TypeReference
): FdrCjsSdk.api.v1.register.TypeReference | undefined {
    if (typeof extraProperties === "boolean") {
        return extraProperties ? TypeReference.unknown() : undefined;
    } else if (typeof extraProperties === "string") {
        return {
            type: "id",
            value: FdrCjsSdk.TypeId(extraProperties),
            default: undefined
        };
    } else {
        return convertTypeReference(extraProperties);
    }
}
