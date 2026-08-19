import { AstNode } from "./AstNode.js";
import { Writer } from "./Writer.js";

export declare namespace DocComment {
    interface Parameter {
        name: string;
        description: string;
    }

    interface Args {
        summary?: string;
        description?: string;
        parameters?: Parameter[];
        returns?: string;
        errors?: string[];
        examples?: string[];
    }
}

export class DocComment extends AstNode {
    private readonly summary?: string;
    private readonly description?: string;
    private readonly parameters: DocComment.Parameter[];
    private readonly returns?: string;
    private readonly examples: string[];

    public constructor({ summary, description, parameters, returns, errors, examples }: DocComment.Args) {
        super();
        this.summary = summary ? this.sanitizeText(summary) : undefined;
        this.description = description ? this.sanitizeText(description) : undefined;
        this.parameters = (parameters ?? []).map((param) => ({
            name: param.name,
            description: this.sanitizeText(param.description)
        }));
        this.returns = returns ? this.sanitizeText(returns) : undefined;
        this.examples = (examples ?? []).map((e) => this.sanitizeText(e));
    }

    public write(writer: Writer): void {
        let hasContent = false;

        // Write summary
        if (this.summary) {
            this.writeMultilineText(writer, this.summary);
            hasContent = true;
        }

        // Write description if present
        if (this.description) {
            if (hasContent) {
                writer.write("///");
                writer.newLine();
            }
            this.writeMultilineText(writer, this.description);
            hasContent = true;
        }

        // Write parameters using Rust documentation conventions
        if (this.parameters.length > 0) {
            if (hasContent) {
                writer.write("///");
                writer.newLine();
            }
            hasContent = true;
            writer.write("/// # Arguments");
            writer.newLine();
            writer.write("///");
            writer.newLine();

            this.parameters.forEach((param) => {
                const paramLines = param.description.split("\n");
                paramLines.forEach((line, lineIdx) => {
                    if (lineIdx === 0) {
                        writer.write(`/// * \`${param.name}\` - ${line.trim()}`);
                    } else {
                        writer.write(`/// ${line.trim()}`);
                    }
                    writer.newLine();
                });
            });
        }

        // Write return information
        if (this.returns) {
            if (hasContent) {
                writer.write("///");
                writer.newLine();
            }
            hasContent = true;
            writer.write("/// # Returns");
            writer.newLine();
            writer.write("///");
            writer.newLine();
            const returnLines = this.returns.split("\n");
            returnLines.forEach((line) => {
                writer.write(`/// ${line.trim()}`);
                writer.newLine();
            });
        }

        // Write examples
        if (this.examples.length > 0) {
            if (hasContent) {
                writer.write("///");
                writer.newLine();
            }
            writer.write("/// # Examples");
            writer.newLine();
            writer.write("///");
            writer.newLine();
            this.examples.forEach((example) => {
                // Use `no_run` so `cargo test` compiles doctests without executing
                // them against live services.
                writer.write("/// ```no_run");
                writer.newLine();
                this.writeCodeBlock(writer, example);
                writer.write("/// ```");
                writer.newLine();
            });
        }
    }

    private writeMultilineText(writer: Writer, text: string): void {
        const lines = text.split("\n");
        for (const line of lines) {
            writer.write("/// ");
            writer.write(line.trim());
            writer.newLine();
        }
    }

    private writeCodeBlock(writer: Writer, code: string): void {
        const lines = code.split("\n");
        for (const line of lines) {
            // Preserve indentation within code blocks; only trim trailing whitespace.
            const trimmed = line.trimEnd();
            writer.write(trimmed.length > 0 ? `/// ${trimmed}` : "///");
            writer.newLine();
        }
    }

    /**
     * Sanitizes text content to ensure it doesn't break Rust doc comment syntax.
     */
    private sanitizeText(text: string): string {
        return (
            text
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                // biome-ignore lint/suspicious/noControlCharactersInRegex: allow
                .replace(/\x00/g, "") // Remove null bytes
                .trim()
        );
    }
}
