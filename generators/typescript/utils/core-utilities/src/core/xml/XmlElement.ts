import { type XmlNode, parseXml } from "./parse";
import { type XmlContent, type XmlSerializable, serializeXmlElement } from "./serialize";

export declare namespace XmlElement {
    interface Fields {
        name: string;
        attributes?: Record<string, string>;
        /** Text content; shorthand for a single leading text segment in `content`. */
        text?: string;
        /** Child elements; shorthand for appending them to `content` after `text`. */
        children?: XmlElement[];
        /** Ordered text segments and child elements. Takes precedence over `text` and `children`. */
        content?: XmlContent[];
    }
}

/** An arbitrary XML element, used to carry child elements the API definition does not know about. */
export class XmlElement implements XmlSerializable {
    public name: string;
    public attributes: Record<string, string>;
    /** Ordered text segments and child elements. */
    public content: XmlContent[];

    constructor({ name, attributes = {}, text, children = [], content }: XmlElement.Fields) {
        this.name = name;
        this.attributes = attributes;
        this.content = content ?? [...(text != null ? [text] : []), ...children];
    }

    /** All text segments of the element joined together, if any. */
    public get text(): string | undefined {
        const segments = this.content.filter((item): item is string => typeof item === "string");
        return segments.length === 0 ? undefined : segments.join("");
    }

    /** The generic child elements, in order. */
    public get children(): XmlElement[] {
        return this.content.filter((item): item is XmlElement => item instanceof XmlElement);
    }

    public static fromXml(xml: string | XmlNode): XmlElement {
        const node = parseXml(xml);
        return new XmlElement({
            name: node.name,
            attributes: { ...node.attributes },
            content: node.content.map((item) => (typeof item === "string" ? item : XmlElement.fromXml(item))),
        });
    }

    /** Serializes the element, without an XML declaration unless `xmlDeclaration` is `true`. */
    public toXml(xmlDeclaration = false): string {
        return serializeXmlElement({
            name: this.name,
            attributes: Object.entries(this.attributes).map(([name, value]) => ({ name, value })),
            content: this.content,
            xmlDeclaration,
        });
    }

    public toString(): string {
        return this.toXml();
    }
}
