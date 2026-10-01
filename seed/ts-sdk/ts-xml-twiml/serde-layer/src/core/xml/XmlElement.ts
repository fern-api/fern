import { parseXml, type XmlNode } from "./parse.js";
import { serializeXmlElement, type XmlSerializable } from "./serialize.js";

export declare namespace XmlElement {
    interface Fields {
        name: string;
        attributes?: Record<string, string>;
        text?: string;
        children?: XmlElement[];
    }
}

/** An arbitrary XML element, used to carry child elements the API definition does not know about. */
export class XmlElement implements XmlSerializable {
    public name: string;
    public attributes: Record<string, string>;
    public text: string | undefined;
    public children: XmlElement[];

    constructor({ name, attributes = {}, text, children = [] }: XmlElement.Fields) {
        this.name = name;
        this.attributes = attributes;
        this.text = text;
        this.children = children;
    }

    public static fromXml(xml: string | XmlNode): XmlElement {
        const node = parseXml(xml);
        return new XmlElement({
            name: node.name,
            attributes: { ...node.attributes },
            text: node.text,
            children: node.children.map((child) => XmlElement.fromXml(child)),
        });
    }

    public toXml(): string {
        return serializeXmlElement({
            name: this.name,
            attributes: Object.entries(this.attributes).map(([name, value]) => ({ name, value })),
            text: this.text,
            additionalChildren: this.children,
        });
    }

    public toString(): string {
        return this.toXml();
    }
}
