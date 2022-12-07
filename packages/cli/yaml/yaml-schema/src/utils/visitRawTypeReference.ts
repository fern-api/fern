import { PrimitiveType } from "@fern-fern/ir-model/types";
import { RawPrimitiveType } from "./RawPrimitiveType";

const MAP_REGEX = /^map<\s*(.*)\s*,\s*(.*)\s*>$/;
const LIST_REGEX = /^list<\s*(.*)\s*>$/;
const SET_REGEX = /^set<\s*(.*)\s*>$/;
const OPTIONAL_REGEX = /^optional<\s*(.*)\s*>$/;
const LITERAL_REGEX = /^literal<\s*"(.*)"\s*>$/;

export interface RawTypeReferenceVisitor<R> {
    primitive: (primitive: PrimitiveType) => R;
    map: (args: { keyType: string; valueType: string }) => R;
    list: (valueType: string) => R;
    set: (valueType: string) => R;
    optional: (valueType: string) => R;
    literal: (literalValue: string) => R;
    named: (named: string) => R;
    unknown: () => R;
    void: () => R;
}

export function visitRawTypeReference<R>(type: string, visitor: RawTypeReferenceVisitor<R>): R {
    switch (type) {
        case RawPrimitiveType.integer:
            return visitor.primitive(PrimitiveType.Integer);
        case RawPrimitiveType.double:
            return visitor.primitive(PrimitiveType.Double);
        case RawPrimitiveType.long:
            return visitor.primitive(PrimitiveType.Long);
        case RawPrimitiveType.string:
            return visitor.primitive(PrimitiveType.String);
        case RawPrimitiveType.boolean:
            return visitor.primitive(PrimitiveType.Boolean);
        case RawPrimitiveType.datetime:
            return visitor.primitive(PrimitiveType.DateTime);
        case RawPrimitiveType.uuid:
            return visitor.primitive(PrimitiveType.Uuid);
        case RawPrimitiveType.void:
            return visitor.void();
        case RawPrimitiveType.unknown:
            return visitor.unknown();
    }

    const mapMatch = type.match(MAP_REGEX);
    if (mapMatch?.[1] != null && mapMatch[2] != null) {
        return visitor.map({
            keyType: mapMatch[1],
            valueType: mapMatch[2],
        });
    }

    const listMatch = type.match(LIST_REGEX);
    if (listMatch?.[1] != null) {
        return visitor.list(listMatch[1]);
    }

    const setMatch = type.match(SET_REGEX);
    if (setMatch?.[1] != null) {
        return visitor.set(setMatch[1]);
    }

    const optionalMatch = type.match(OPTIONAL_REGEX);
    if (optionalMatch?.[1] != null) {
        return visitor.optional(optionalMatch[1]);
    }

    const literalMatch = type.match(LITERAL_REGEX);
    if (literalMatch?.[1] != null) {
        return visitor.literal(literalMatch[1]);
    }

    return visitor.named(type);
}
