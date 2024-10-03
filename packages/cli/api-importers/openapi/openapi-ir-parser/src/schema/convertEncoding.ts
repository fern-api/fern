import { Encoding } from "@fern-api/openapi-ir";
import { RawSchemas } from "@fern-api/fern-definition-schema";

export function convertEncoding(encodingSchema: RawSchemas.EncodingSchema): Encoding | undefined {
    if (encodingSchema.proto != null) {
        return Encoding.protobuf({
            typeName: encodingSchema.proto.type
        });
    }
    return undefined;
}
