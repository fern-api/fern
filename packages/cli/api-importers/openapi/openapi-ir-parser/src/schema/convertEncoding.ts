import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Encoding } from "@fern-api/openapi-ir";

export function convertEncoding({
    encodingSchema,
    fallbackXmlName
}: {
    encodingSchema: RawSchemas.EncodingSchema;
    fallbackXmlName: string;
}): Encoding | undefined {
    if (encodingSchema.proto != null) {
        return Encoding.protobuf({
            typeName: encodingSchema.proto.type
        });
    }
    if (encodingSchema.xml != null) {
        return Encoding.xml({
            name: encodingSchema.xml.name ?? fallbackXmlName,
            namespace: encodingSchema.xml.namespace,
            prefix: encodingSchema.xml.prefix
        });
    }
    return undefined;
}
