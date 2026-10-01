import { isXmlSerializable, toArray, type XmlContent, type XmlSerializable } from "./serialize.js";
import { XmlElement } from "./XmlElement.js";

/**
 * Reconciles an element's ordered content with its typed child properties. Everything in the
 * content keeps its position; typed children that were set without going through the content
 * (e.g. by a bulk setter) are appended at the end in property order, once per extra reference.
 */
export function orderXmlContent(content: readonly XmlContent[], ...typedChildren: unknown[]): XmlContent[] {
    const typed: XmlSerializable[] = [];
    for (const value of typedChildren) {
        collectXmlSerializable(value, typed);
    }
    const remaining = new Map<XmlSerializable, number>();
    for (const child of typed) {
        remaining.set(child, (remaining.get(child) ?? 0) + 1);
    }
    const take = (child: XmlSerializable): boolean => {
        const count = remaining.get(child) ?? 0;
        if (count === 0) {
            return false;
        }
        remaining.set(child, count - 1);
        return true;
    };
    const ordered: XmlContent[] = [...content];
    for (const item of content) {
        if (typeof item !== "string" && !(item instanceof XmlElement)) {
            take(item);
        }
    }
    for (const child of typed) {
        if (take(child)) {
            ordered.push(child);
        }
    }
    return ordered;
}

function collectXmlSerializable(value: unknown, into: XmlSerializable[]): void {
    if (value == null) {
        return;
    }
    const items = toArray(value);
    if (items != null) {
        for (const item of items) {
            collectXmlSerializable(item, into);
        }
    } else if (isXmlSerializable(value)) {
        into.push(value);
    }
}

/**
 * Replaces the typed children of one property in an ordered content sequence: the previous values
 * are removed (once per reference) and new values not already present are appended.
 */
export function replaceXmlContent(content: XmlContent[], previous: unknown, next: unknown): XmlContent[] {
    const removed: XmlSerializable[] = [];
    collectXmlSerializable(previous, removed);
    const remaining = new Map<XmlSerializable, number>();
    for (const child of removed) {
        remaining.set(child, (remaining.get(child) ?? 0) + 1);
    }
    const result: XmlContent[] = [];
    for (const item of content) {
        const count = typeof item === "string" ? 0 : (remaining.get(item) ?? 0);
        if (count > 0) {
            remaining.set(item, count - 1);
        } else {
            result.push(item);
        }
    }
    const added: XmlSerializable[] = [];
    collectXmlSerializable(next, added);
    const present = new Set<XmlContent>(result);
    for (const child of added) {
        if (!present.has(child)) {
            present.add(child);
            result.push(child);
        }
    }
    return result;
}
