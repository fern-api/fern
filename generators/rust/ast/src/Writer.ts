export class Writer {
    private content: string[] = [];
    private indentLevel = 0;
    private needsIndent = true;

    public write(text: string): void {
        if (this.needsIndent && text.length > 0) {
            this.content.push("    ".repeat(this.indentLevel));
            this.needsIndent = false;
        }
        this.content.push(text);
    }

    public writeLine(text: string = ""): void {
        this.write(text);
        this.newLine();
    }

    public newLine(): void {
        this.content.push("\n");
        this.needsIndent = true;
    }

    public indent(): void {
        this.indentLevel++;
    }

    public dedent(): void {
        if (this.indentLevel > 0) {
            this.indentLevel--;
        }
    }

    public toString(): string {
        return this.content.join("");
    }

    public writeBlock(header: string, body: () => void): void {
        this.writeLine(`${header} {`);
        this.indent();
        body();
        this.dedent();
        this.writeLine("}");
    }
}
