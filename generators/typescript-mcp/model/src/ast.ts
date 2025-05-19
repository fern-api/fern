import { ts } from "@fern-api/typescript-ast";

import { PrimitiveTypeV1, SingleUnionType, TypeReference } from "@fern-fern/ir-sdk/api";

export function primitiveTypeV1Mapper(primitiveTypeV1: PrimitiveTypeV1) {
    return PrimitiveTypeV1._visit(primitiveTypeV1, {
        integer: () => "number()",
        long: () => "number()",
        uint: () => "number()",
        uint64: () => "number()",
        float: () => "number()",
        double: () => "number()",
        boolean: () => "boolean()",
        string: () => "string()",
        date: () => "date()",
        dateTime: () => "string().datetime()",
        uuid: () => "string().uuid()",
        base64: () => "string().base64()",
        bigInteger: () => "bigint()",
        _other: () => "any()"
    });
}

// TODO: finish implementing this
export function singleUnionTypeMapper(singleUnionType: SingleUnionType) {
    return singleUnionType.shape._visit({
        samePropertiesAsObject: (value) => "unknown()",
        singleProperty: (value) => "unknown()",
        noProperties: () => "unknown()",
        _other: (value) => "any()"
    });
}

// TODO: finish implementing this
export function typeReferenceMapper(typeReference: TypeReference) {
    return typeReference._visit({
        container: (value) => "unknown()",
        named: (value) => "unknown()",
        primitive: (value) => primitiveTypeV1Mapper(value.v1),
        unknown: () => "unknown()",
        _other: (value) => "any()"
    });
}
