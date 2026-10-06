export const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

export interface XmlSerializable {
    /**
     * Serializes the value to XML. Implementations choose their own default for
     * `xmlDeclaration`; nested serialization always passes `false`.
     */
    toXml(xmlDeclaration?: boolean): string;
}

/** One item of an element's ordered content: a text segment, or a child element or comment (anything serializable). */
export type XmlContent = string | XmlSerializable;

export function isXmlSerializable(value: unknown): value is XmlSerializable {
    return (
        typeof value === "object" &&
        value != null &&
        "toXml" in value &&
        typeof (value as { toXml: unknown }).toXml === "function"
    );
}

export interface XmlAttribute {
    name: string;
    value: unknown;
    /** Joins array values into a single attribute value (e.g. " " for space-delimited lists). */
    separator?: string;
}

export interface XmlChild {
    /**
     * Element name used for scalar values and for the wrapper element of wrapped lists.
     * Values that are themselves `XmlSerializable` render with their own element name.
     */
    name: string;
    value: unknown;
    wrapped?: boolean;
}

/**
 * Shape of a generic element (see `XmlElement`) whose children can be merged into a wrapper
 * element of the same name, so undeclared children inside wrapped lists round-trip.
 * Elements carrying text are not merged since a wrapper has no text of its own.
 */
interface XmlWrapperFragment extends XmlSerializable {
    name: string;
    attributes: Record<string, string>;
    text?: undefined;
    children: XmlSerializable[];
}

function isXmlWrapperFragment(value: XmlSerializable): value is XmlWrapperFragment {
    return (
        "name" in value &&
        typeof value.name === "string" &&
        "attributes" in value &&
        typeof value.attributes === "object" &&
        value.attributes != null &&
        "children" in value &&
        Array.isArray(value.children) &&
        (!("text" in value) || value.text == null)
    );
}

export interface SerializeXmlElementArgs {
    name: string;
    namespace?: string;
    prefix?: string;
    attributes?: XmlAttribute[];
    text?: unknown;
    textSeparator?: string;
    children?: XmlChild[];
    /**
     * Text segments and child elements rendered in order after `text` and the `children` that have no
     * position marker. A generic element named after a wrapped child marks where that wrapper renders.
     */
    content?: XmlContent[];
    additionalChildren?: XmlSerializable[];
    xmlDeclaration?: boolean;
}

const DEFAULT_LIST_SEPARATOR = " ";

export function serializeXmlElement({
    name,
    namespace,
    prefix,
    attributes = [],
    text,
    textSeparator,
    children = [],
    content = [],
    additionalChildren = [],
    xmlDeclaration = false,
}: SerializeXmlElementArgs): string {
    const tag = prefix != null && prefix.length > 0 ? `${prefix}:${name}` : name;
    const parts: string[] = [`<${tag}`];
    if (namespace != null) {
        const xmlns = prefix != null && prefix.length > 0 ? `xmlns:${prefix}` : "xmlns";
        parts.push(` ${xmlns}="${escapeXml(namespace)}"`);
    }
    for (const attribute of attributes) {
        const rendered = joinScalars(attribute.value, attribute.separator);
        if (rendered != null) {
            parts.push(` ${attribute.name}="${escapeXml(rendered)}"`);
        }
    }

    const wrapperNames = new Set(children.filter((child) => child.wrapped === true).map((child) => child.name));
    const wrapperFragments: XmlWrapperFragment[] = [];
    const orderedContent: XmlContent[] = [];
    for (const item of [...content, ...additionalChildren]) {
        if (typeof item !== "string" && isXmlWrapperFragment(item) && wrapperNames.has(localXmlName(item.name))) {
            wrapperFragments.push(item);
            orderedContent.push(item);
        } else {
            orderedContent.push(item);
        }
    }
    const markedWrappers = new Set(wrapperFragments.map((fragment) => localXmlName(fragment.name)));
    const renderWrapped = (child: XmlChild): string[] =>
        renderChild(
            child,
            wrapperFragments.filter((fragment) => localXmlName(fragment.name) === child.name),
        );

    const body: string[] = [];
    const renderedText = joinScalars(text, textSeparator);
    if (renderedText != null) {
        body.push(escapeXml(renderedText));
    }
    for (const child of children) {
        if (!markedWrappers.has(child.name)) {
            body.push(...renderWrapped(child));
        }
    }
    const renderedWrappers = new Set<string>();
    for (const item of orderedContent) {
        if (typeof item === "string") {
            body.push(escapeXml(item));
        } else if (isXmlWrapperFragment(item) && markedWrappers.has(localXmlName(item.name))) {
            const wrapperName = localXmlName(item.name);
            if (!renderedWrappers.has(wrapperName)) {
                renderedWrappers.add(wrapperName);
                for (const child of children) {
                    if (child.name === wrapperName) {
                        body.push(...renderWrapped(child));
                    }
                }
            }
        } else {
            body.push(item.toXml(false));
        }
    }

    if (body.length === 0) {
        parts.push(" />");
    } else {
        parts.push(">", ...body, `</${tag}>`);
    }
    const element = parts.join("");
    return xmlDeclaration ? `${XML_DECLARATION}${element}` : element;
}

export function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Converts an attribute or text value to its wire string, or undefined when unset. */
export function formatXmlScalar(value: unknown): string | undefined {
    if (value == null) {
        return undefined;
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    throw new Error(`Cannot serialize value of type ${typeof value} as XML text`);
}

/** Renders additional (undeclared) attributes, which are always plain strings. */
export function extraXmlAttributes(attributes: Record<string, string> | undefined): XmlAttribute[] {
    if (attributes == null) {
        return [];
    }
    return Object.entries(attributes).map(([name, value]) => ({ name, value }));
}

export function toArray(value: unknown): unknown[] | undefined {
    if (Array.isArray(value)) {
        return value;
    }
    if (value instanceof Set) {
        return Array.from(value);
    }
    return undefined;
}

function joinScalars(value: unknown, separator: string | undefined): string | undefined {
    if (value == null) {
        return undefined;
    }
    const items = toArray(value);
    if (items != null) {
        return items
            .map(formatXmlScalar)
            .filter((item): item is string => item != null)
            .join(separator ?? DEFAULT_LIST_SEPARATOR);
    }
    return formatXmlScalar(value);
}

function localXmlName(name: string): string {
    const colon = name.indexOf(":");
    return colon === -1 ? name : name.substring(colon + 1);
}

function renderChild({ name, value, wrapped = false }: XmlChild, wrapperFragments: XmlWrapperFragment[]): string[] {
    if (value == null && wrapperFragments.length === 0) {
        return [];
    }
    const items = value == null ? [] : (toArray(value) ?? [value]);
    const rendered: string[] = [];
    for (const item of items) {
        if (item == null) {
            continue;
        }
        if (isXmlSerializable(item)) {
            rendered.push(item.toXml(false));
        } else {
            rendered.push(serializeXmlElement({ name, text: item }));
        }
    }
    if (!wrapped) {
        return rendered;
    }
    const wrapperAttributes: string[] = [];
    for (const fragment of wrapperFragments) {
        for (const [attributeName, attributeValue] of Object.entries(fragment.attributes)) {
            wrapperAttributes.push(` ${attributeName}="${escapeXml(attributeValue)}"`);
        }
        rendered.push(...fragment.children.map((child) => child.toXml(false)));
    }
    const open = `<${name}${wrapperAttributes.join("")}`;
    return [rendered.length === 0 ? `${open} />` : `${open}>${rendered.join("")}</${name}>`];
}
