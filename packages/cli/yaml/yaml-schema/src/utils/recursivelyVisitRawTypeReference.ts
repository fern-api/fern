import { PrimitiveType } from "@fern-fern/ir-sdk/api";
import { visitRawTypeReference } from "./visitRawTypeReference";

export interface RecursiveRawTypeReferenceVisitor<R> {
    primitive: (primitive: PrimitiveType) => R;
    map: (args: { keyType: R; valueType: R }) => R;
    list: (valueType: R) => R;
    set: (valueType: R) => R;
    optional: (valueType: R) => R;
    literal: (literalValue: string) => R;
    named: (named: string) => R;
    unknown: () => R;
}

export function recursivelyVisitRawTypeReference<R>(type: string, visitor: RecursiveRawTypeReferenceVisitor<R>): R {
    return visitRawTypeReference(type, {
        primitive: visitor.primitive,
        map: ({ keyType, valueType }) =>
            visitor.map({
                keyType: recursivelyVisitRawTypeReference(keyType, visitor),
                valueType: recursivelyVisitRawTypeReference(valueType, visitor),
            }),
        list: (valueType) => visitor.list(recursivelyVisitRawTypeReference(valueType, visitor)),
        set: (valueType) => visitor.set(recursivelyVisitRawTypeReference(valueType, visitor)),
        optional: (valueType) => visitor.optional(recursivelyVisitRawTypeReference(valueType, visitor)),
        literal: visitor.literal,
        named: visitor.named,
        unknown: visitor.unknown,
    });
}
