import { Encoding } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";

export function convertEncoding(encodingSchema: RawSchemas.EncodingSchema): Encoding | undefined {
    if (encodingSchema.proto != null) {
        return Encoding.protobuf({
            typeName: encodingSchema.proto.type
        });
    }
    return undefined;
}
