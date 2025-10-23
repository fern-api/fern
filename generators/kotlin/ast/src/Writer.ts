export class Writer {
    private buffer: string[] = [];
    private indentLevel = 0;
    private readonly indentString = "    "; // 4 spaces for Kotlin
    private needsIndent = true;

    public write(content: string): void {
        if (content.length === 0) {
            return;
        }

        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line == null) {
                continue;
            }
            if (i > 0) {
                this.buffer.push("\n");
                this.needsIndent = true;
            }
            if (line.length > 0) {
                if (this.needsIndent) {
                    this.buffer.push(this.indentString.repeat(this.indentLevel));
                    this.needsIndent = false;
                }
                this.buffer.push(line);
            }
        }
    }

    public writeLine(content = ""): void {
        this.write(content);
        this.newLine();
    }

    public newLine(): void {
        this.buffer.push("\n");
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

    public writeBlock(content: () => void): void {
        this.write("{");
        this.newLine();
        this.indent();
        content();
        this.dedent();
        this.writeLine("}");
    }

    public toString(): string {
        return this.buffer.join("");
    }
}
