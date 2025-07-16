import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Encoding } from "@fern-api/openapi-ir";

export function convertToEncodingSchema(encoding: Encoding): RawSchemas.EncodingSchema {
    switch (encoding.type) {
        case "protobuf":
            return {
                proto: {
                    type: encoding.typeName
                }
            };
        default:
            assertNever(encoding.type);
    }
}
