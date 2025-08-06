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
        this.summary = summary;
        this.description = description;
        this.parameters = parameters ?? [];
        this.returns = returns;
        this.throws = throws ?? [];
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

    private writeMultilineText(writer: Writer, text: string) {
        const lines = text.split("\n");
        for (const line of lines) {
            writer.write("/// ");
            writer.write(line);
            writer.newLine();
        }
    }
}
