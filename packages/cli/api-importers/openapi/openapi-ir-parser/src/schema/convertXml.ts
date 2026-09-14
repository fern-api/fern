import { Encoding, XmlPropertyEncoding } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../getExtension.js";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions.js";

/**
 * An object schema is treated as an XML element when it declares an OpenAPI `xml` object.
 * The element name defaults to the schema's generated name when `xml.name` is absent.
 */
export function getXmlEncoding({
    schema,
    fallbackName
}: {
    schema: OpenAPIV3.SchemaObject;
    fallbackName: string;
}): Encoding | undefined {
    if (schema.xml == null) {
        return undefined;
    }
    return Encoding.xml({
        name: schema.xml.name ?? fallbackName,
        namespace: schema.xml.namespace,
        prefix: schema.xml.prefix
    });
}

/**
 * Reads the `xml` object and Fern XML extensions from a property schema. Metadata declared
 * inline on the property wins over metadata on the referenced schema.
 */
export function getXmlPropertyEncoding({
    propertySchema,
    resolvedPropertySchema
}: {
    propertySchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    resolvedPropertySchema: OpenAPIV3.SchemaObject;
}): XmlPropertyEncoding | undefined {
    const inlineXml = "xml" in propertySchema ? propertySchema.xml : undefined;
    const xml = inlineXml ?? resolvedPropertySchema.xml;
    const text =
        getExtension<boolean>(propertySchema, FernOpenAPIExtension.XML_TEXT) ??
        getExtension<boolean>(resolvedPropertySchema, FernOpenAPIExtension.XML_TEXT);
    const separator =
        getExtension<string>(propertySchema, FernOpenAPIExtension.XML_LIST_SEPARATOR) ??
        getExtension<string>(resolvedPropertySchema, FernOpenAPIExtension.XML_LIST_SEPARATOR);
    const encoding: XmlPropertyEncoding = {
        name: xml?.name,
        attribute: xml?.attribute,
        text: text ?? undefined,
        wrapped: xml?.wrapped,
        separator: separator ?? undefined
    };
    return Object.values(encoding).every((value) => value == null) ? undefined : encoding;
}
