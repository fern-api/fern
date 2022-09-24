import { PrimitiveType } from "@fern-fern/ir-model/types";
import { RawPrimitiveType } from "./RawPrimitiveType";

const MAP_REGEX = /^map<\s*(.*)\s*,\s*(.*)\s*>$/;
const LIST_REGEX = /^list<\s*(.*)\s*>$/;
const SET_REGEX = /^set<\s*(.*)\s*>$/;
const OPTIONAL_REGEX = /^optional<\s*(.*)\s*>$/;

export interface RawTypeReferenceVisitor<R> {
    primitive: (primitive: PrimitiveType) => R;
    map: (args: { keyType: R; valueType: R }) => R;
    list: (valueType: R) => R;
    set: (valueType: R) => R;
    optional: (valueType: R) => R;
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
            keyType: visitRawTypeReference(mapMatch[1], visitor),
            valueType: visitRawTypeReference(mapMatch[2], visitor),
        });
    }

    const listMatch = type.match(LIST_REGEX);
    if (listMatch?.[1] != null) {
        return visitor.list(visitRawTypeReference(listMatch[1], visitor));
    }

    const setMatch = type.match(SET_REGEX);
    if (setMatch?.[1] != null) {
        return visitor.set(visitRawTypeReference(setMatch[1], visitor));
    }

    const optionalMatch = type.match(OPTIONAL_REGEX);
    if (optionalMatch?.[1] != null) {
        return visitor.optional(visitRawTypeReference(optionalMatch[1], visitor));
    }

    return visitor.named(type);
}
