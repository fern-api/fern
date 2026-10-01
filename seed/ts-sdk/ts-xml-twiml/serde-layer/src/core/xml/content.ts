import { isXmlSerializable, toArray, type XmlContent, type XmlSerializable } from "./serialize.js";
import { XmlElement } from "./XmlElement.js";

/**
 * Reconciles an element's ordered content with its typed child properties. Text segments and
 * generic elements keep their position; a typed child keeps its position as long as a typed
 * property still references it (once per reference), and typed children that were set without
 * going through the content (e.g. by a bulk setter) are appended at the end in property order.
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
    const ordered: XmlContent[] = [];
    for (const item of content) {
        if (typeof item === "string" || item instanceof XmlElement || take(item)) {
            ordered.push(item);
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
