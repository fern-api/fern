import { assertNever } from "@fern-api/core-utils";
import { Encoding } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";

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
