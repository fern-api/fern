import { XmlEncoding, XmlPropertyEncoding, XmlPropertyKind } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractExtension } from "../AbstractExtension.js";

export const X_FERN_XML_TEXT = "x-fern-xml-text";
export const X_FERN_XML_LIST_SEPARATOR = "x-fern-xml-list-separator";

export declare namespace XmlSchemaExtension {
    export interface Args extends AbstractExtension.Args {
        schema: OpenAPIV3_1.SchemaObject;
        fallbackName: string;
    }
}

/**
 * Reads the OpenAPI `xml` object on an object schema and produces the type-level `XmlEncoding`.
 * The element name defaults to the schema name when `xml.name` is omitted.
 */
export class XmlSchemaExtension extends AbstractExtension<XmlEncoding> {
    private readonly schema: OpenAPIV3_1.SchemaObject;
    private readonly fallbackName: string;
    public readonly key = "xml";

    constructor({ breadcrumbs, schema, fallbackName, context }: XmlSchemaExtension.Args) {
        super({ breadcrumbs, context });
        this.schema = schema;
        this.fallbackName = fallbackName;
    }

    public convert(): XmlEncoding | undefined {
        const xml = this.getExtensionValue(this.schema);
        if (!isXmlObject(xml)) {
            return undefined;
        }
        return {
            name: typeof xml.name === "string" ? xml.name : this.fallbackName,
            namespace: typeof xml.namespace === "string" ? xml.namespace : undefined,
            prefix: typeof xml.prefix === "string" ? xml.prefix : undefined
        };
    }
}

export declare namespace XmlPropertyExtension {
    export interface Args extends AbstractExtension.Args {
        propertySchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        resolvedPropertySchema: OpenAPIV3_1.SchemaObject | undefined;
    }
}

/**
 * Reads the OpenAPI `xml` object and the `x-fern-xml-text` / `x-fern-xml-list-separator`
 * extensions on a property schema and produces the property-level `XmlPropertyEncoding`.
 * Extensions declared inline on the property win over those on the referenced schema.
 * Properties without any XML metadata default to child elements.
 */
export class XmlPropertyExtension extends AbstractExtension<XmlPropertyEncoding> {
    private readonly propertySchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    private readonly resolvedPropertySchema: OpenAPIV3_1.SchemaObject | undefined;
    public readonly key = "xml";

    constructor({ breadcrumbs, propertySchema, resolvedPropertySchema, context }: XmlPropertyExtension.Args) {
        super({ breadcrumbs, context });
        this.propertySchema = propertySchema;
        this.resolvedPropertySchema = resolvedPropertySchema;
    }

    public convert(): XmlPropertyEncoding {
        const inline = this.propertySchema;
        const resolved = this.resolvedPropertySchema;

        const xml = firstDefined(this.getExtensionValue(inline), this.getExtensionValue(resolved));
        const isText = firstDefined(readExtension(inline, X_FERN_XML_TEXT), readExtension(resolved, X_FERN_XML_TEXT));
        const listSeparator = firstDefined(
            readExtension(inline, X_FERN_XML_LIST_SEPARATOR),
            readExtension(resolved, X_FERN_XML_LIST_SEPARATOR)
        );

        const xmlObject: OpenAPIV3_1.XMLObject = isXmlObject(xml) ? xml : {};
        return {
            kind: getKind({ isText: isText === true, isAttribute: xmlObject.attribute === true }),
            name: typeof xmlObject.name === "string" ? xmlObject.name : undefined,
            wrapped: typeof xmlObject.wrapped === "boolean" ? xmlObject.wrapped : undefined,
            listSeparator: typeof listSeparator === "string" ? listSeparator : undefined
        };
    }
}

function getKind({ isText, isAttribute }: { isText: boolean; isAttribute: boolean }): XmlPropertyKind {
    if (isText) {
        return XmlPropertyKind.Text;
    }
    if (isAttribute) {
        return XmlPropertyKind.Attribute;
    }
    return XmlPropertyKind.Element;
}

function isXmlObject(value: unknown): value is OpenAPIV3_1.XMLObject {
    return typeof value === "object" && value != null;
}

function readExtension(schema: unknown, key: string): unknown {
    if (typeof schema !== "object" || schema == null) {
        return undefined;
    }
    return (schema as Record<string, unknown>)[key];
}

function firstDefined(...values: unknown[]): unknown {
    return values.find((value) => value != null);
}
