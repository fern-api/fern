import { Literal, PrimitiveType } from "@fern-api/ir-sdk";

import { ValidationSchema } from "../schemas";
import { visitRawTypeReference } from "./visitRawTypeReference";

export interface RecursiveRawTypeReferenceVisitor<R> {
    primitive: (primitive: PrimitiveType) => R;
    map: (args: { keyType: R; valueType: R }) => R;
    list: (valueType: R) => R;
    set: (valueType: R) => R;
    optional: (valueType: R) => R;
    literal: (literal: Literal) => R;
    named: (named: string) => R;
    unknown: () => R;
}

export function recursivelyVisitRawTypeReference<R>({
    type,
    _default,
    validation,
    visitor
}: {
    type: string;
    _default: unknown | undefined;
    validation: ValidationSchema | undefined;
    visitor: RecursiveRawTypeReferenceVisitor<R>;
}): R {
    return visitRawTypeReference({
        type,
        _default,
        validation,
        visitor: {
            primitive: visitor.primitive,
            map: ({ keyType, valueType }) =>
                visitor.map({
                    keyType: recursivelyVisitRawTypeReference({
                        type: keyType,
                        _default: undefined,
                        validation: undefined,
                        visitor
                    }),
                    valueType: recursivelyVisitRawTypeReference({
                        type: valueType,
                        _default: undefined,
                        validation: undefined,
                        visitor
                    })
                }),
            list: (valueType) =>
                visitor.list(
                    recursivelyVisitRawTypeReference({
                        type: valueType,
                        _default: undefined,
                        validation: undefined,
                        visitor
                    })
                ),
            set: (valueType) =>
                visitor.set(
                    recursivelyVisitRawTypeReference({
                        type: valueType,
                        _default: undefined,
                        validation: undefined,
                        visitor
                    })
                ),
            optional: (valueType) =>
                visitor.optional(recursivelyVisitRawTypeReference({ type: valueType, _default, validation, visitor })),
            literal: visitor.literal,
            named: visitor.named,
            unknown: visitor.unknown
        }
    });
}
