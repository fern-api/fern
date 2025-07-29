import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Statement } from "./Statement";
import { Expression } from "./Expression";

export declare namespace CodeBlock {
    type Args =
        | { type: "statements"; statements: Statement[] }
        | { type: "expression"; expression: Expression }
        | { type: "empty" };
}

export class CodeBlock extends AstNode {
    private constructor(private readonly args: CodeBlock.Args) {
        super();
    }

    public write(writer: Writer): void {
        writer.write("{");
        writer.newLine();
        writer.indent();

        switch (this.args.type) {
            case "statements": {
                const stmtArgs = this.args as Extract<CodeBlock.Args, { type: "statements" }>;
                stmtArgs.statements.forEach((stmt, index) => {
                    stmt.write(writer);
                    if (index < stmtArgs.statements.length - 1) {
                        writer.newLine();
                    }
                });
                break;
            }

            case "expression":
                // Implicit return in Rust - last expression without semicolon
                this.args.expression.write(writer);
                break;

            case "empty":
                // Empty block
                break;
        }

        writer.dedent();
        writer.newLine();
        writer.write("}");
    }

    // Factory methods
    public static empty(): CodeBlock {
        return new CodeBlock({ type: "empty" });
    }

    public static fromStatements(statements: Statement[]): CodeBlock {
        return new CodeBlock({ type: "statements", statements });
    }

    public static fromExpression(expression: Expression): CodeBlock {
        return new CodeBlock({ type: "expression", expression });
    }

    public static fromStatementsAndExpression(statements: Statement[], expression: Expression): CodeBlock {
        // In Rust, we can have statements followed by a final expression (implicit return)
        return new CodeBlock({
            type: "statements",
            statements: [
                ...statements,
                Statement.raw(expression.toString()) // Expression without semicolon
            ]
        });
    }
}
