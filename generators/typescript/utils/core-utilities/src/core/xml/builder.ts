import { XML_DECLARATION, type XmlContent, XmlSerializable } from "./serialize";
import { XmlComment } from "./XmlComment";

/** A mutable, fluent builder for an xml-encoded model of type `T`. */
export interface XmlBuilder<T> extends XmlSerializable {
    build(): T;
    /** Comments rendered as siblings of the built element (see `XmlSiblingComments`). */
    readonly siblingComments?: XmlSiblingComments;
}

/**
 * Comments placed next to an element rather than inside it: before its start tag and after its end
 * tag. When the element is built as part of a parent's content the comments become the parent's
 * content around it; when it is serialized on its own they surround the root element.
 */
export class XmlSiblingComments {
    public readonly before: XmlComment[] = [];
    public readonly after: XmlComment[] = [];

    public isEmpty(): boolean {
        return this.before.length === 0 && this.after.length === 0;
    }

    /** Surrounds a serialized element with the comments, keeping an XML declaration first. */
    public wrap(xml: string): string {
        if (this.isEmpty()) {
            return xml;
        }
        const declaration = xml.startsWith(XML_DECLARATION) ? XML_DECLARATION : "";
        return [
            declaration,
            ...this.before.map((comment) => comment.toXml()),
            xml.substring(declaration.length),
            ...this.after.map((comment) => comment.toXml()),
        ].join("");
    }
}

export function isXmlBuilder<T>(value: T | XmlBuilder<T>): value is XmlBuilder<T> {
    return (
        typeof value === "object" &&
        value != null &&
        "build" in value &&
        typeof value.build === "function" &&
        "toXml" in value &&
        typeof value.toXml === "function"
    );
}

/** Resolves a value that may still be a builder into the built model. */
export function xmlBuild<T>(value: T | XmlBuilder<T>): T {
    return isXmlBuilder(value) ? value.build() : value;
}

export function xmlBuildAll<T, N extends null | undefined>(
    values: readonly (T | XmlBuilder<T>)[] | N,
): T[] | N {
    return values == null ? values : values.map((value) => xmlBuild(value));
}

/** Built ordered content plus resolvers that return the same built instance for a builder appearing in it. */
export interface XmlBuiltContent {
    content: XmlContent[];
    build<T>(value: T | XmlBuilder<T>): T;
    buildAll<T, N extends null | undefined>(values: readonly (T | XmlBuilder<T>)[] | N): T[] | N;
}

/**
 * Builds every builder in an ordered content sequence exactly once, so that typed child
 * properties and the content refer to the same built instances (which keeps their order aligned).
 * A builder's sibling comments are placed into the content around its built element.
 */
export function xmlBuildContent(content: readonly XmlContent[]): XmlBuiltContent {
    const built = new Map<XmlBuilder<unknown>, unknown>();
    function build<T>(value: T | XmlBuilder<T>): T {
        if (!isXmlBuilder(value)) {
            return value;
        }
        if (!built.has(value)) {
            built.set(value, value.build());
        }
        // The map stores each builder's own build() result, so the entry for a `XmlBuilder<T>` is a `T`.
        return built.get(value) as T;
    }
    return {
        content: content.flatMap((item): XmlContent[] => {
            if (typeof item === "string") {
                return [item];
            }
            const siblings = isXmlBuilder(item) ? item.siblingComments : undefined;
            return siblings == null ? [build(item)] : [...siblings.before, build(item), ...siblings.after];
        }),
        build,
        buildAll: (values) => (values == null ? values : values.map((value) => build(value))),
    };
}

/**
 * Combines explicit ordered content with legacy `additionalChildren`, appending only the
 * additional children that are not already part of the content (a model instance exposes both).
 */
export function xmlInitialContent(
    content: readonly XmlContent[] | undefined,
    additionalChildren: readonly XmlSerializable[] | undefined,
): XmlContent[] {
    const result: XmlContent[] = [...(content ?? [])];
    const seen = new Set<XmlContent>(result);
    for (const child of additionalChildren ?? []) {
        if (!seen.has(child)) {
            seen.add(child);
            result.push(child);
        }
    }
    return result;
}
