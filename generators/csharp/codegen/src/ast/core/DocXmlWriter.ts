import { Writer } from "..";

export class DocXmlWriter {
    writer: Writer;
    constructor(writer: Writer) {
        this.writer = writer;
    }

    public writeLine(text?: string): this {
        this.writer.writeLine(`/// ${text}`);
        return this;
    }

    public writePrefix(): this {
        this.writer.write("/// ");
        return this;
    }

    public writeOpenNode(nodeName: string): this {
        this.writeLine(`<${nodeName}>`);
        return this;
    }

    public writeCloseNode(nodeName: string): this {
        this.writeLine(`</${nodeName}>`);
        return this;
    }

    public writeNode(nodeName: string, text: string): this {
        this.writeOpenNode(nodeName);
        this.writeMultiline(text);
        this.writeCloseNode(nodeName);
        return this;
    }

    public writeNodeWithEscaping(nodeName: string, text: string): this {
        this.writeOpenNode(nodeName);
        this.writeMultilineWithEscaping(text);
        this.writeCloseNode(nodeName);
        return this;
    }

    public writeMultiline(text: string): this {
        text.trim()
            .split("\n")
            .forEach((line) => {
                this.writeLine(line);
            });
        return this;
    }

    public writeMultilineWithEscaping(text: string): this {
        text = this.escapeXmlDocContent(text);
        this.writeMultiline(text);
        return this;
    }

    private escapeXmlDocContent(text: string): string {
        return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
}
