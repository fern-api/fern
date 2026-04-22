import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { FernIr as Ir, TypeReference } from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";
import { convertIrAvailability } from "./convertPackage.js";
import { getOriginalName, getWireValue } from "./nameUtils.js";

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
                default: enum_.default != null ? getWireValue(enum_.default.name) : undefined,
                values: enum_.values.map(
                    (value): FdrCjsSdk.api.v1.register.EnumValue => ({
                        description: value.docs ?? undefined,
                        value: getWireValue(value.name),
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
                        key: FdrCjsSdk.PropertyKey(getWireValue(property.name)),
                        valueType: convertTypeReference(property.valueType),
                        availability: convertIrAvailability(property.availability),
                        propertyAccess: property.propertyAccess
                    })
                ),
                extraProperties: convertExtraProperties(object.extraProperties)
            };
        },
        union: (union) => {
            const baseProperties: FdrCjsSdk.api.v1.register.ObjectProperty[] = union.baseProperties.map(
                (baseProperty): FdrCjsSdk.api.v1.register.ObjectProperty => {
                    return {
                        key: FdrCjsSdk.PropertyKey(getWireValue(baseProperty.name)),
                        valueType: convertTypeReference(baseProperty.valueType),
                        availability: convertIrAvailability(baseProperty.availability),
                        description: baseProperty.docs,
                        propertyAccess: baseProperty.propertyAccess
                    };
                }
            );
            return {
                type: "discriminatedUnion",
                discriminant: getWireValue(union.discriminant),
                variants: union.types.map((variant): FdrCjsSdk.api.v1.register.DiscriminatedUnionVariant => {
                    return {
                        description: variant.docs ?? undefined,
                        discriminantValue: getWireValue(variant.discriminantValue),
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
                                                key: FdrCjsSdk.PropertyKey(getWireValue(singleProperty.name)),
                                                valueType: convertTypeReference(singleProperty.type),
                                                description: undefined,
                                                availability: undefined,
                                                propertyAccess: undefined
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
                                        throw new CliError({
                                            message:
                                                "Unknown SingleUnionTypeProperties: " + variant.shape.propertiesType,
                                            code: CliError.Code.InternalError
                                        });
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
                        typeName: variant.type.type === "named" ? getOriginalName(variant.type.name) : undefined,
                        description: variant.docs ?? undefined,
                        type: convertTypeReference(variant.type),
                        availability: undefined,
                        // If displayName is not specified, don't fall back to originalName
                        // originalName may contain generated names (e.g., "ObjectsObjectTypeBatchUpsertPostRequestBody...")
                        // which are not user-friendly and should not be user-facing
                        displayName: variant.type.type === "named" ? variant.type.displayName : undefined
                    };
                })
            };
        },
        _other: () => {
            throw new CliError({ message: "Unknown Type shape: " + irType.type, code: CliError.Code.InternalError });
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
                        itemType: convertTypeReference(itemType),
                        minItems: undefined,
                        maxItems: undefined
                    };
                },
                map: ({ keyType, valueType }) => {
                    return {
                        type: "map",
                        keyType: convertTypeReference(keyType),
                        valueType: convertTypeReference(valueType),
                        minProperties: undefined,
                        maxProperties: undefined
                    };
                },
                optional: (itemType) => {
                    return {
                        type: "optional",
                        itemType: convertTypeReference(itemType),
                        defaultValue: undefined
                    };
                },
                nullable: (itemType) => {
                    return {
                        type: "nullable",
                        itemType: convertTypeReference(itemType)
                    };
                },
                set: (itemType) => {
                    return {
                        type: "set",
                        itemType: convertTypeReference(itemType),
                        minItems: undefined,
                        maxItems: undefined
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
                            throw new CliError({
                                message: "Unknown literal type: " + literal.type,
                                code: CliError.Code.InternalError
                            });
                        }
                    });
                },
                _other: () => {
                    throw new CliError({
                        message: "Unknown container reference: " + container.type,
                        code: CliError.Code.InternalError
                    });
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
                        return convertLong(primitive.v2);
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
                            mimeType: undefined,
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
                        return convertUint(primitive.v2);
                    },
                    uint64: () => {
                        return convertUint64(primitive.v2);
                    },
                    dateTimeRfc2822: () => {
                        return {
                            type: "datetime",
                            default: undefined
                        };
                    },
                    _other: () => {
                        throw new CliError({
                            message: "Unknown primitive: " + primitive.v1,
                            code: CliError.Code.InternalError
                        });
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
            throw new CliError({
                message: "Unknown Type reference: " + irTypeReference.type,
                code: CliError.Code.InternalError
            });
        }
    });
}

function convertString(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.StringValidationRules | undefined =
        primitive != null && primitive.type === "string" ? primitive.validation : undefined;
    return {
        type: "string",
        format: rules != null ? rules.format : undefined,
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
        minimum: rules?.exclusiveMin === true ? undefined : rules?.min,
        maximum: rules?.exclusiveMax === true ? undefined : rules?.max,
        exclusiveMinimum: rules?.exclusiveMin === true ? rules?.min : undefined,
        exclusiveMaximum: rules?.exclusiveMax === true ? rules?.max : undefined,
        multipleOf: rules?.multipleOf,
        default: primitive != null && primitive.type === "integer" ? primitive.default : undefined
    };
}

function convertDouble(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.DoubleValidationRules | undefined =
        primitive != null && primitive.type === "double" ? primitive.validation : undefined;
    return {
        type: "double",
        minimum: rules?.exclusiveMin === true ? undefined : rules?.min,
        maximum: rules?.exclusiveMax === true ? undefined : rules?.max,
        exclusiveMinimum: rules?.exclusiveMin === true ? rules?.min : undefined,
        exclusiveMaximum: rules?.exclusiveMax === true ? rules?.max : undefined,
        multipleOf: rules?.multipleOf,
        default: primitive != null && primitive.type === "double" ? primitive.default : undefined
    };
}

function convertLong(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.LongValidationRules | undefined =
        primitive != null && primitive.type === "long" ? primitive.validation : undefined;
    return {
        type: "long",
        minimum: rules?.exclusiveMin === true ? undefined : rules?.min,
        maximum: rules?.exclusiveMax === true ? undefined : rules?.max,
        exclusiveMinimum: rules?.exclusiveMin === true ? rules?.min : undefined,
        exclusiveMaximum: rules?.exclusiveMax === true ? rules?.max : undefined,
        multipleOf: rules?.multipleOf,
        default: primitive != null && primitive.type === "long" ? primitive.default : undefined
    };
}

function convertUint(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.UintValidationRules | undefined =
        primitive != null && primitive.type === "uint" ? primitive.validation : undefined;
    return {
        type: "uint",
        minimum: rules?.exclusiveMin === true ? undefined : rules?.min,
        maximum: rules?.exclusiveMax === true ? undefined : rules?.max,
        exclusiveMinimum: rules?.exclusiveMin === true ? rules?.min : undefined,
        exclusiveMaximum: rules?.exclusiveMax === true ? rules?.max : undefined,
        multipleOf: rules?.multipleOf,
        default: primitive != null && primitive.type === "uint" ? primitive.default : undefined
    };
}

function convertUint64(primitive: Ir.PrimitiveTypeV2 | undefined): FdrCjsSdk.api.v1.register.PrimitiveType {
    const rules: Ir.Uint64ValidationRules | undefined =
        primitive != null && primitive.type === "uint64" ? primitive.validation : undefined;
    return {
        type: "uint64",
        minimum: rules?.exclusiveMin === true ? undefined : rules?.min,
        maximum: rules?.exclusiveMax === true ? undefined : rules?.max,
        exclusiveMinimum: rules?.exclusiveMin === true ? rules?.min : undefined,
        exclusiveMaximum: rules?.exclusiveMax === true ? rules?.max : undefined,
        multipleOf: rules?.multipleOf,
        default: primitive != null && primitive.type === "uint64" ? primitive.default : undefined
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
