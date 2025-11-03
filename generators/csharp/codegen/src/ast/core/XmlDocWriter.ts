import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";
import { XmlDocBlock } from "../language/XmlDocBlock";
import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export class XmlDocWriter {
    private writer: Writer;
    private wrotePrefixOnCurrentLine: boolean = false;
    constructor(writer: Writer) {
        this.writer = writer;
    }

    public write(text: string | XmlDocBlock): void {
        if (typeof text === "string") {
            this.writer.write(text);
            return;
        }
        text.write(this.writer);
    }

    public writeWithEscaping(text: string | XmlDocBlock): void {
        if (typeof text === "string") {
            this.writer.write(this.escapeXmlDocContent(text));
            return;
        }
        text.write(this.writer);
    }

    public writeLine(text = ""): void {
        this.writePrefix();
        this.writer.writeLine(text);
        this.wrotePrefixOnCurrentLine = false;
    }

    public writeLineWithEscaping(text: string): void {
        this.writePrefix();
        this.writer.write(this.escapeXmlDocContent(text));
        this.wrotePrefixOnCurrentLine = false;
    }

    public writeNewLineIfLastLineNot(): void {
        this.writer.writeNewLineIfLastLineNot();
        this.wrotePrefixOnCurrentLine = false;
    }

    public writeNodeOrString(input: AbstractAstNode | string): void {
        this.writer.write(input);
    }

    public writePrefix(): this {
        if (this.wrotePrefixOnCurrentLine) {
            return this;
        }
        this.writer.write("/// ");
        this.wrotePrefixOnCurrentLine = true;
        return this;
    }

    public writeOpenXmlNode(nodeName: string): void {
        this.write(`<${nodeName}>`);
    }

    public writeCloseXmlNode(nodeName: string): void {
        this.write(`</${nodeName}>`);
    }

    public writeNode(node: AstNode): void {
        this.writer.writeNode(node);
    }

    public writeXmlNode(nodeName: string, text: string): void {
        this.writePrefix();
        this.writeOpenXmlNode(nodeName);
        this.writeLine(text);
        this.writePrefix();
        this.writeCloseXmlNode(nodeName);
    }

    public writeXmlNodeMultiline(nodeName: string, text: string): void {
        this.writePrefix();
        this.writeOpenXmlNode(nodeName);
        this.writeLine();
        this.writeMultiline(text);
        this.writeLine();
        this.writePrefix();
        this.writeCloseXmlNode(nodeName);
    }

    public writeXmlNodeWithEscaping(nodeName: string, text: string): void {
        this.writeOpenXmlNode(nodeName);
        this.writeLineWithEscaping(text);
        this.writeCloseXmlNode(nodeName);
    }

    public writeMultilineNodeWithEscaping(nodeName: string, text: string): void {
        this.writeOpenXmlNode(nodeName);
        this.writeLine();
        this.writeMultilineWithEscaping(text);
        this.writeLine();
        this.writeCloseXmlNode(nodeName);
    }

    public writeMultiline(text: string): void {
        text.trim()
            .split("\n")
            .forEach((line) => {
                this.writeLine(line);
            });
    }

    public writeMultilineWithEscaping(text: string): void {
        text = this.escapeXmlDocContent(text);
        this.writeMultiline(text);
    }

    private escapeXmlDocContent(text: string): string {
        return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
}
