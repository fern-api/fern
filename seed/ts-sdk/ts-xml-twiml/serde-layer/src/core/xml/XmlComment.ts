import type { XmlSerializable } from "./serialize.js";

/** An XML comment (`<!--text-->`), kept in an element's ordered content like a text segment or child element. */
export class XmlComment implements XmlSerializable {
    constructor(public text: string) {}

    public toXml(): string {
        return `<!--${this.text}-->`;
    }

    public toString(): string {
        return this.toXml();
    }
}

export function isXmlComment(value: unknown): value is XmlComment {
    return value instanceof XmlComment;
}
