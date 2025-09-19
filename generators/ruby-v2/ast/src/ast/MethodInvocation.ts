import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        /** The instance to invoke the method on */
        on: AstNode;
        /** The method to invoke */
        method: string;
        /** Positional arguments passed to the method */
        arguments_: AstNode[];
        /** Keyword arguments passed to the method */
        keywordArguments?: [string, AstNode][];
        /** If the method is being passed a block, the list of args and the code contained in the block */
        block?: [string[], AstNode[]];
    }
}

type PositionalOrKeywordArgument =
    | { kind: "positional"; node: AstNode }
    | { kind: "keyword"; name: string; node: AstNode };

export class MethodInvocation extends AstNode {
    private on: AstNode;
    private method: string;
    private arguments_: AstNode[];
    private keywordArguments?: [string, AstNode][];
    private block?: [string[], AstNode[]];

    constructor({ on, method, arguments_, keywordArguments, block }: MethodInvocation.Args) {
        super();
        this.on = on;
        this.method = method;
        this.arguments_ = arguments_;
        this.keywordArguments = keywordArguments;
        this.block = block;
    }

    public write(writer: Writer): void {
        this.on.write(writer);
        writer.write(".");
        writer.write(this.method);
        // If there is more than one argument, write each argument on its own line,
        // separated by commas, for better readability in the generated Ruby code.
        // Otherwise, write the arguments inline (on the same line).
        writer.write("(");

        const allArguments: PositionalOrKeywordArgument[] = [];
        for (const node of this.arguments_) {
            allArguments.push({ kind: "positional", node });
        }
        for (const [name, node] of this.keywordArguments || []) {
            allArguments.push({ kind: "keyword", name, node });
        }

        if (allArguments.length > 1) {
            writer.indent();
            writer.newLine();
            allArguments.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(",");
                    writer.newLine();
                }
                writeArgument(writer, argument);
            });
            writer.newLine();
            writer.dedent();
        } else {
            allArguments.forEach((argument, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writeArgument(writer, argument);
            });
        }
        writer.write(")");
        if (this.block) {
            const [args, codelines] = this.block;
            writer.write(" do");

            if (args.length > 0) {
                writer.write(" |");
                args.forEach((argument, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    writer.write(argument);
                });
                writer.write("|");
            }

            writer.newLine();
            writer.indent();
            for (const line of codelines) {
                line.write(writer);
                writer.writeNewLineIfLastLineNot();
            }
            writer.dedent();
            writer.write("end");
        }
    }
}

function writeArgument(writer: Writer, arg: PositionalOrKeywordArgument): void {
    switch (arg.kind) {
        case "positional":
            arg.node.write(writer);
            break;
        case "keyword":
            writer.write(arg.name);
            writer.write(": ");
            arg.node.write(writer);
            break;
        default:
            assertNever(arg);
    }
}
