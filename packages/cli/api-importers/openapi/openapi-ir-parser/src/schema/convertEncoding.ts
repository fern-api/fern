import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Encoding } from "@fern-api/openapi-ir";

export function convertEncoding(encodingSchema: RawSchemas.EncodingSchema): Encoding | undefined {
    if (encodingSchema.proto != null) {
        return Encoding.protobuf({
            typeName: encodingSchema.proto.type
        });
    }
    return undefined;
}
