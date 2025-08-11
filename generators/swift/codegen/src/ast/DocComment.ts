import { AstNode, Writer } from "./core";

export declare namespace DocComment {
    interface Parameter {
        name: string;
        description: string;
    }

    interface Args {
        summary: string;
        description?: string;
        parameters?: Parameter[];
        returns?: string;
        throws?: string[];
    }
}

export class DocComment extends AstNode {
    private readonly summary: string;
    private readonly description?: string;
    private readonly parameters: DocComment.Parameter[];
    private readonly returns?: string;
    private readonly throws: string[];

    public constructor({ summary, description, parameters, returns, throws }: DocComment.Args) {
        super();
        this.summary = DocComment.sanitizeText(summary);
        this.description = description != null ? DocComment.sanitizeText(description) : undefined;
        this.parameters = (parameters ?? []).map((param) => ({
            name: param.name,
            description: DocComment.sanitizeText(param.description)
        }));
        this.returns = returns != null ? DocComment.sanitizeText(returns) : undefined;
        this.throws = (throws ?? []).map((t) => DocComment.sanitizeText(t));
    }

    public write(writer: Writer): void {
        this.writeMultilineText(writer, this.summary);
        if (this.description != null) {
            writer.write("///");
            writer.newLine();
            this.writeMultilineText(writer, this.description);
        }
        if (this.parameters.length > 0) {
            writer.write("///");
            writer.newLine();
            for (const param of this.parameters) {
                const paramLines = param.description.split("\n");
                paramLines.forEach((line, lineIdx) => {
                    if (lineIdx === 0) {
                        writer.write("/// - Parameter ");
                        writer.write(param.name);
                        writer.write(": ");
                        writer.write(line);
                    } else {
                        writer.write("/// ");
                        writer.write(line);
                    }
                    writer.newLine();
                });
            }
        }
        if (this.returns != null) {
            const returnLines = this.returns.split("\n");
            returnLines.forEach((line, lineIdx) => {
                if (lineIdx === 0) {
                    writer.write("/// - Returns: ");
                    writer.write(line);
                } else {
                    writer.write("/// ");
                    writer.write(line);
                }
                writer.newLine();
            });
        }
        if (this.throws.length > 0) {
            for (const throwsDescription of this.throws) {
                const throwsLines = throwsDescription.split("\n");
                throwsLines.forEach((line, lineIdx) => {
                    if (lineIdx === 0) {
                        writer.write("/// - Throws: ");
                        writer.write(line);
                    } else {
                        writer.write("/// ");
                        writer.write(line);
                    }
                    writer.newLine();
                });
            }
        }
    }

    private writeMultilineText(writer: Writer, sanitizedText: string) {
        const lines = sanitizedText.split("\n");
        for (const line of lines) {
            writer.write("/// ");
            writer.write(line);
            writer.newLine();
        }
    }

    /**
     * Sanitizes text content to ensure it doesn't break Swift doc comment syntax.
     * Handles line endings and binary content that cause compilation issues.
     */
    private static sanitizeText(text: string): string {
        // Normalize line endings - carriage returns break doc comment format
        text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        // Remove null bytes - they cause "nul character embedded in middle of file" warnings
        // This causes a compiler warning (not error) but we should remove it nevertheless
        // biome-ignore lint/suspicious/noControlCharactersInRegex: allow
        text = text.replace(/\x00/g, "");

        return text;
    }
}
