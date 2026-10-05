import { XmlSerializable } from "./serialize";

/** A mutable, fluent builder for an xml-encoded model of type `T`. */
export interface XmlBuilder<T> extends XmlSerializable {
    build(): T;
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
