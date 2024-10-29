import { Writer } from "..";

export class DocXmlWriter {
    writer: Writer;
    constructor(writer: Writer) {
        this.writer = writer;
    }

    public writeLine(text?: string): void {
        this.writer.writeLine(`/// ${text}`);
    }

    public writePrefix(): this {
        this.writer.write("/// ");
        return this;
    }

    public writeOpenNode(nodeName: string): void {
        this.writeLine(`<${nodeName}>`);
    }

    public writeCloseNode(nodeName: string): void {
        this.writeLine(`</${nodeName}>`);
    }

    public writeNode(nodeName: string, text: string): void {
        this.writeOpenNode(nodeName);
        this.writeMultiline(text);
        this.writeCloseNode(nodeName);
    }

    public writeNodeWithEscaping(nodeName: string, text: string): void {
        this.writeOpenNode(nodeName);
        this.writeMultilineWithEscaping(text);
        this.writeCloseNode(nodeName);
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
