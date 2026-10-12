import { type XmlNode, XmlParseError, isXmlCommentNode, localName } from "./parse";
import { type XmlContent, type XmlSerializable } from "./serialize";
import { XmlComment } from "./XmlComment";
import { XmlElement } from "./XmlElement";

const DEFAULT_LIST_SEPARATOR = " ";

/** Converts the raw wire string of an attribute or text node into a typed value. */
export type XmlScalarParser<T> = (raw: string, location: string) => T;

export type XmlNodeParser<T> = (node: XmlNode) => T;

export const xmlString: XmlScalarParser<string> = (raw) => raw;

export const xmlInteger: XmlScalarParser<number> = (raw, location) => {
    const value = Number(raw.trim());
    if (raw.trim().length === 0 || !Number.isInteger(value)) {
        throw invalidValue(raw, "an integer", location);
    }
    return value;
};

export const xmlNumber: XmlScalarParser<number> = (raw, location) => {
    const value = Number(raw.trim());
    if (raw.trim().length === 0 || Number.isNaN(value)) {
        throw invalidValue(raw, "a number", location);
    }
    return value;
};

export const xmlBoolean: XmlScalarParser<boolean> = (raw, location) => {
    const normalized = raw.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
        return true;
    }
    if (normalized === "false" || normalized === "0") {
        return false;
    }
    throw invalidValue(raw, "a boolean", location);
};

export const xmlBigInt: XmlScalarParser<bigint> = (raw, location) => {
    try {
        return BigInt(raw.trim());
    } catch {
        throw invalidValue(raw, "an integer", location);
    }
};

export const xmlDate: XmlScalarParser<Date> = (raw, location) => {
    const value = new Date(raw.trim());
    if (Number.isNaN(value.getTime())) {
        throw invalidValue(raw, "a date", location);
    }
    return value;
};

const MAX_ENUM_VALUES_IN_ERROR = 10;

export function xmlEnum<T extends string>(values: readonly T[]): XmlScalarParser<T> {
    return (raw, location) => {
        const match = values.find((value) => value === raw);
        if (match == null) {
            const shown = values.slice(0, MAX_ENUM_VALUES_IN_ERROR).map((value) => `"${value}"`);
            if (values.length > MAX_ENUM_VALUES_IN_ERROR) {
                shown.push(`… (${values.length - MAX_ENUM_VALUES_IN_ERROR} more)`);
            }
            throw invalidValue(raw, `one of ${shown.join(", ")}`, location);
        }
        return match;
    };
}

export function xmlScalar<T>(raw: string | undefined, parser: XmlScalarParser<T>, location: string): T | undefined {
    return raw == null ? undefined : parser(raw, location);
}

export function xmlScalarList<T>(
    raw: string | undefined,
    separator: string | undefined,
    parser: XmlScalarParser<T>,
    location: string,
): T[] | undefined {
    if (raw == null) {
        return undefined;
    }
    return raw
        .split(separator ?? DEFAULT_LIST_SEPARATOR)
        .filter((item) => item.length > 0)
        .map((item) => parser(item, location));
}

export function xmlToSet<T, N extends null | undefined>(values: T[] | N): Set<T> | N {
    return values == null ? values : new Set(values);
}

export function xmlRequired<T>(value: T | undefined, location: string): T {
    if (value == null) {
        throw new XmlParseError(`${location} is required`);
    }
    return value;
}

/** Returns the raw attribute value, if present. */
export function xmlAttribute(node: XmlNode, name: string): string | undefined {
    return node.attributes[name];
}

/** Returns the element's own text content, if any. */
export function xmlText(node: XmlNode): string | undefined {
    return node.text;
}

/** Returns the text that precedes the first child element, if any (and not blank). */
export function xmlLeadingText(node: XmlNode): string | undefined {
    const segments: string[] = [];
    for (const item of node.content) {
        if (typeof item !== "string") {
            break;
        }
        segments.push(item);
    }
    return segments.length === 0 ? undefined : segments.join("");
}

export interface XmlContentOptions {
    /** Skip the text before the first child element (it is read separately as the text property). */
    skipLeadingText?: boolean;
    /** (Prefix-less) names of child elements read separately (e.g. scalar-valued elements). */
    skip?: readonly string[];
    /**
     * Wrapper elements of wrapped lists (prefix-less wrapper name -> known item names). A wrapper is
     * kept in the content as an `XmlElement` carrying only its attributes and undeclared children,
     * which marks the wrapper's position and is merged back into it by `serializeXmlElement`.
     */
    wrappers?: Record<string, readonly string[]>;
    /** Parses a known child element; return undefined to keep the child as a generic `XmlElement`. */
    parse?: (child: XmlNode) => XmlSerializable | undefined;
}

/**
 * Reads the element's text segments, comments and child elements in document order. Known children
 * are parsed with `parse`; any other child is kept verbatim as an `XmlElement`, comments as `XmlComment`.
 */
export function xmlContent(
    node: XmlNode,
    { skipLeadingText = false, skip = [], wrappers = {}, parse }: XmlContentOptions = {},
): XmlContent[] {
    const content: XmlContent[] = [];
    let beforeFirstElement = true;
    for (const item of node.content) {
        if (typeof item === "string") {
            if (!(skipLeadingText && beforeFirstElement)) {
                content.push(item);
            }
            continue;
        }
        beforeFirstElement = false;
        if (isXmlCommentNode(item)) {
            content.push(new XmlComment(item.comment));
            continue;
        }
        const name = localName(item.name);
        if (skip.includes(name)) {
            continue;
        }
        const wrapperItems = wrappers[name];
        if (wrapperItems != null) {
            content.push(
                new XmlElement({
                    name: item.name,
                    attributes: { ...item.attributes },
                    content: xmlContent(item, { skip: wrapperItems }),
                }),
            );
            continue;
        }
        content.push(parse?.(item) ?? XmlElement.fromXml(item));
    }
    return content;
}

/** The typed children of `content` matching `isItem`, in order, or undefined when there are none. */
export function xmlContentElements<T extends XmlContent>(
    content: readonly XmlContent[],
    isItem: (item: XmlContent) => item is T,
): T[] | undefined {
    const items = content.filter(isItem);
    return items.length === 0 ? undefined : items;
}

/**
 * For wrapper elements listed in `wrappers` (wrapper name -> known item names), the wrapper's
 * attributes and undeclared children preserved as an `XmlElement` named after the wrapper, which
 * `serializeXmlElement` merges back into the wrapper on output.
 */
export function xmlWrapperFragments(node: XmlNode, wrappers: Record<string, readonly string[]>): XmlElement[] {
    return xmlUnknownChildren(node, [], wrappers).filter((child) => localName(child.name) in wrappers);
}

/** Builds a node parser for a child element whose text content is a scalar value. */
export function xmlScalarChild<T>(parser: XmlScalarParser<T>, location: string): XmlNodeParser<T> {
    return (node) => parser(node.text ?? "", location);
}

/**
 * Parses the child elements whose (prefix-less) names appear in `parsers`, in document order.
 * With `wrapper`, children are read from that single wrapper element instead. Returns undefined
 * when no matching children (or no wrapper element) are present.
 */
export function xmlChildren<T>(
    node: XmlNode,
    parsers: Record<string, XmlNodeParser<T>>,
    { wrapper }: { wrapper?: string } = {},
): T[] | undefined {
    let container = node;
    if (wrapper != null) {
        const wrapperNode = node.children.find((child) => localName(child.name) === wrapper);
        if (wrapperNode == null) {
            return undefined;
        }
        container = wrapperNode;
    }
    const items: T[] = [];
    for (const child of container.children) {
        const parser = parsers[localName(child.name)];
        if (parser != null) {
            items.push(parser(child));
        }
    }
    if (wrapper == null && items.length === 0) {
        return undefined;
    }
    return items;
}

/** Parses the first child element whose name appears in `parsers`, if any. */
export function xmlChild<T>(node: XmlNode, parsers: Record<string, XmlNodeParser<T>>): T | undefined {
    return xmlChildren(node, parsers)?.[0];
}

/** Attributes of `node` other than `known` and namespace declarations. */
export function xmlExtraAttributes(node: XmlNode, known: readonly string[]): Record<string, string> {
    const extra: Record<string, string> = {};
    for (const [name, value] of Object.entries(node.attributes)) {
        if (!known.includes(name) && name !== "xmlns" && !name.startsWith("xmlns:")) {
            extra[name] = value;
        }
    }
    return extra;
}

/**
 * Child elements of `node` whose (prefix-less) names are not in `known`, preserved verbatim.
 * For wrapper elements listed in `wrappers` (wrapper name -> known item names), the wrapper's
 * attributes and undeclared children are preserved as an `XmlElement` named after the wrapper, which
 * `serializeXmlElement` merges back into the wrapper on output.
 */
export function xmlUnknownChildren(
    node: XmlNode,
    known: readonly string[],
    wrappers: Record<string, readonly string[]> = {},
): XmlElement[] {
    const unknown: XmlElement[] = [];
    for (const child of node.children) {
        const name = localName(child.name);
        const wrapperItems = wrappers[name];
        if (wrapperItems != null) {
            const unknownItems = xmlUnknownChildren(child, wrapperItems);
            if (unknownItems.length > 0 || Object.keys(child.attributes).length > 0) {
                unknown.push(new XmlElement({ name: child.name, attributes: child.attributes, children: unknownItems }));
            }
        } else if (!known.includes(name)) {
            unknown.push(XmlElement.fromXml(child));
        }
    }
    return unknown;
}

function invalidValue(raw: string, expected: string, location: string): XmlParseError {
    return new XmlParseError(`${location} must be ${expected} but was "${raw}"`);
}
