import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Encoding, XmlPropertyEncoding } from "@fern-api/openapi-ir";

export function convertToEncodingSchema(encoding: Encoding): RawSchemas.EncodingSchema {
    switch (encoding.type) {
        case "protobuf":
            return {
                proto: {
                    type: encoding.typeName
                }
            };
        case "xml":
            return {
                xml: {
                    name: encoding.name,
                    namespace: encoding.namespace,
                    prefix: encoding.prefix
                }
            };
        default:
            assertNever(encoding);
    }
}

export function convertXmlPropertyToEncodingSchema(xml: XmlPropertyEncoding): RawSchemas.EncodingSchema {
    return {
        xml: {
            name: xml.name,
            attribute: xml.attribute,
            text: xml.text,
            wrapped: xml.wrapped,
            separator: xml.separator
        }
    };
}
