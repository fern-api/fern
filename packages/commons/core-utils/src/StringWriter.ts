/**
 * A simple in-memory string accumulator for building text content.
 * Use this instead of creating custom writer classes or using Node.js
 * streams when you just need to collect string output.
 */
export class StringWriter {
    private content = "";

    public write(content: string): void {
        this.content += content;
    }

    public writeLine(content?: string): void {
        if (content != null) {
            this.write(content);
        }
        this.write("\n");
    }

    public toString(): string {
        return this.content;
    }
}
