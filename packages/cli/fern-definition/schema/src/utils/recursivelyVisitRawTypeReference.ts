import { Literal, PrimitiveType } from "@fern-api/ir-sdk";

import { ValidationSchema } from "../schemas";
import { ContainerValidationRules, MapValidationRules, visitRawTypeReference } from "./visitRawTypeReference";

export interface RecursiveRawTypeReferenceVisitor<R> {
    primitive: (primitive: PrimitiveType) => R;
    map: (args: { keyType: R; valueType: R }, validation?: MapValidationRules) => R;
    list: (valueType: R, validation?: ContainerValidationRules) => R;
    set: (valueType: R, validation?: ContainerValidationRules) => R;
    optional: (valueType: R) => R;
    nullable: (valueType: R) => R;
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
            map: ({ keyType, valueType }, mapValidation) =>
                visitor.map(
                    {
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
                    },
                    mapValidation
                ),
            list: (valueType, containerValidation) =>
                visitor.list(
                    recursivelyVisitRawTypeReference({
                        type: valueType,
                        _default: undefined,
                        validation: undefined,
                        visitor
                    }),
                    containerValidation
                ),
            set: (valueType, containerValidation) =>
                visitor.set(
                    recursivelyVisitRawTypeReference({
                        type: valueType,
                        _default: undefined,
                        validation: undefined,
                        visitor
                    }),
                    containerValidation
                ),
            optional: (valueType) =>
                visitor.optional(recursivelyVisitRawTypeReference({ type: valueType, _default, validation, visitor })),
            nullable: (valueType) =>
                visitor.nullable(recursivelyVisitRawTypeReference({ type: valueType, _default, validation, visitor })),
            literal: visitor.literal,
            named: visitor.named,
            unknown: visitor.unknown
        }
    });
}
