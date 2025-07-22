import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";

import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

export function getSwiftTypeForTypeReference(typeReference: TypeReference): swift.Type {
    switch (typeReference.type) {
        case "container":
            return typeReference.container._visit({
                // TODO(kafkas): Handle these cases
                literal: () => swift.Type.any(),
                map: () => swift.Type.any(),
                set: () => swift.Type.any(),
                nullable: () => swift.Type.any(),
                optional: (ref) => swift.Type.optional(getSwiftTypeForTypeReference(ref)),
                list: (ref) => swift.Type.array(getSwiftTypeForTypeReference(ref)),
                _other: () => swift.Type.any()
            });
        case "primitive":
            // TODO(kafkas): Do we not look at typeReference.primitive.v2?
            return PrimitiveTypeV1._visit(typeReference.primitive.v1, {
                string: () => swift.Type.string(),
                boolean: () => swift.Type.bool(),
                integer: () => swift.Type.int(),
                uint: () => swift.Type.uint(),
                uint64: () => swift.Type.uint64(),
                long: () => swift.Type.int64(),
                float: () => swift.Type.float(),
                double: () => swift.Type.double(),
                // TODO(kafkas): We may need to implement our own value type for this
                bigInteger: () => swift.Type.string(),
                date: () => swift.Type.date(),
                dateTime: () => swift.Type.date(),
                base64: () => swift.Type.string(),
                uuid: () => swift.Type.uuid(),
                _other: () => swift.Type.any()
            });
        case "named":
            return swift.Type.custom(typeReference.name.pascalCase.unsafeName);
        case "unknown":
            return swift.Type.any();
        default:
            assertNever(typeReference);
    }
}
