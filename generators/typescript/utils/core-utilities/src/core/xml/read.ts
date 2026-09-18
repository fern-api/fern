import { type XmlNode, XmlParseError, localName } from "./parse";
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

export function xmlEnum<T extends string>(values: readonly T[]): XmlScalarParser<T> {
    return (raw, location) => {
        const match = values.find((value) => value === raw);
        if (match == null) {
            throw invalidValue(raw, `one of ${values.map((value) => `"${value}"`).join(", ")}`, location);
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
