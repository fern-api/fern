import { Literal, PrimitiveType, PrimitiveTypeV1, PrimitiveTypeV2 } from "@fern-api/ir-sdk";

import { NumberValidationSchema } from "../schemas";
import { StringValidationSchema } from "../schemas";
import { ValidationSchema } from "../schemas";
import { RawPrimitiveType } from "./RawPrimitiveType";

export const FernContainerRegex = {
    MAP: /^map<\s*([^,]*)\s*,\s*(.*)\s*>$/,
    LIST: /^list<\s*(.*)\s*>$/,
    SET: /^set<\s*(.*)\s*>$/,
    OPTIONAL: /^optional<\s*(.*)\s*>$/,
    LITERAL: /^literal<\s*(?:"(.*)"|(true|false))\s*>$/
};

export interface RawTypeReferenceVisitor<R> {
    primitive: (primitive: PrimitiveType) => R;
    map: (args: { keyType: string; valueType: string }) => R;
    list: (valueType: string) => R;
    set: (valueType: string) => R;
    optional: (valueType: string) => R;
    literal: (literal: Literal) => R;
    named: (named: string) => R;
    unknown: () => R;
}

export function visitRawTypeReference<R>({
    type,
    _default,
    validation,
    visitor
}: {
    type: string;
    _default?: unknown;
    validation?: ValidationSchema;
    visitor: RawTypeReferenceVisitor<R>;
}): R {
    switch (type) {
        case RawPrimitiveType.integer: {
            const maybeNumberValidation = validation != null ? (validation as NumberValidationSchema) : undefined;
            return visitor.primitive({
                v1: PrimitiveTypeV1.Integer,
                v2: PrimitiveTypeV2.integer({
                    default: _default != null ? (_default as number) : undefined,
                    validation:
                        maybeNumberValidation != null
                            ? {
                                  min: maybeNumberValidation.min,
                                  max: maybeNumberValidation.max,
                                  exclusiveMin: maybeNumberValidation.exclusiveMin,
                                  exclusiveMax: maybeNumberValidation.exclusiveMax,
                                  multipleOf: maybeNumberValidation.multipleOf
                              }
                            : undefined
                })
            });
        }
        case RawPrimitiveType.double: {
            const maybeNumberValidation = validation != null ? (validation as NumberValidationSchema) : undefined;
            return visitor.primitive({
                v1: PrimitiveTypeV1.Double,
                v2: PrimitiveTypeV2.double({
                    default: _default != null ? (_default as number) : undefined,
                    validation:
                        maybeNumberValidation != null
                            ? {
                                  min: maybeNumberValidation.min,
                                  max: maybeNumberValidation.max,
                                  exclusiveMin: maybeNumberValidation.exclusiveMin,
                                  exclusiveMax: maybeNumberValidation.exclusiveMax,
                                  multipleOf: maybeNumberValidation.multipleOf
                              }
                            : undefined
                })
            });
        }
        case RawPrimitiveType.string: {
            const maybeStringValidation = validation != null ? (validation as StringValidationSchema) : undefined;
            return visitor.primitive({
                v1: PrimitiveTypeV1.String,
                v2: PrimitiveTypeV2.string({
                    default: _default != null ? (_default as string) : undefined,
                    validation:
                        maybeStringValidation != null
                            ? {
                                  format: maybeStringValidation.format,
                                  pattern: maybeStringValidation.pattern,
                                  minLength: maybeStringValidation.minLength,
                                  maxLength: maybeStringValidation.maxLength
                              }
                            : undefined
                })
            });
        }
        case RawPrimitiveType.float:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Float,
                v2: undefined
            });
        case RawPrimitiveType.long:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Long,
                v2: PrimitiveTypeV2.long({
                    default: _default != null ? (_default as number) : undefined
                })
            });
        case RawPrimitiveType.boolean:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Boolean,
                v2: PrimitiveTypeV2.boolean({
                    default: _default != null ? (_default as boolean) : undefined
                })
            });
        case RawPrimitiveType.datetime:
            return visitor.primitive({
                v1: PrimitiveTypeV1.DateTime,
                v2: undefined
            });
        case RawPrimitiveType.date:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Date,
                v2: undefined
            });
        case RawPrimitiveType.uuid:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Uuid,
                v2: undefined
            });
        case RawPrimitiveType.base64:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Base64,
                v2: undefined
            });
        case RawPrimitiveType.bigint:
            return visitor.primitive({
                v1: PrimitiveTypeV1.BigInteger,
                v2: PrimitiveTypeV2.bigInteger({
                    default: _default != null ? (_default as string) : undefined
                })
            });
        case RawPrimitiveType.uint:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Uint,
                v2: undefined
            });
        case RawPrimitiveType.uint64:
            return visitor.primitive({
                v1: PrimitiveTypeV1.Uint64,
                v2: undefined
            });
        case RawPrimitiveType.unknown:
            return visitor.unknown();
    }

    const mapMatch = type.match(FernContainerRegex.MAP);
    if (mapMatch?.[1] != null && mapMatch[2] != null) {
        return visitor.map({
            keyType: mapMatch[1],
            valueType: mapMatch[2]
        });
    }

    const listMatch = type.match(FernContainerRegex.LIST);
    if (listMatch?.[1] != null) {
        return visitor.list(listMatch[1]);
    }

    const setMatch = type.match(FernContainerRegex.SET);
    if (setMatch?.[1] != null) {
        return visitor.set(setMatch[1]);
    }

    const optionalMatch = type.match(FernContainerRegex.OPTIONAL);
    if (optionalMatch?.[1] != null) {
        return visitor.optional(optionalMatch[1]);
    }

    const literalMatch = type.match(FernContainerRegex.LITERAL);
    if (literalMatch?.[1] != null) {
        return visitor.literal(Literal.string(literalMatch[1]));
    }
    if (literalMatch?.[2] != null) {
        const group = literalMatch[2];
        switch (group) {
            case "false":
                return visitor.literal(Literal.boolean(false));
            case "true":
                return visitor.literal(Literal.boolean(true));
            default:
                throw new Error(`Unsupported literal value: ${group}`);
        }
    }

    return visitor.named(type);
}
