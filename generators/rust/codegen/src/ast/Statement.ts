import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Expression } from "./Expression";
import { Type } from "./Type";

export declare namespace Statement {
    type Args =
        | { type: "let"; name: string; value: Expression; mutable?: boolean; type_?: Type }
        | { type: "return"; value?: Expression }
        | { type: "expression"; expression: Expression }
        | { type: "assignment"; target: Expression; value: Expression }
        | { type: "if"; condition: Expression; then: Statement[]; else_?: Statement[] }
        | { type: "match"; expression: Expression; arms: MatchArm[] }
        | { type: "while"; condition: Expression; body: Statement[] }
        | { type: "for"; pattern: string; iterable: Expression; body: Statement[] }
        | { type: "raw"; value: string };

    interface MatchArm {
        pattern: string;
        guard?: Expression;
        body: Statement[];
    }
}

export class Statement extends AstNode {
    private constructor(private readonly args: Statement.Args) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.args.type) {
            case "let":
                writer.write("let ");
                if (this.args.mutable) writer.write("mut ");
                writer.write(this.args.name);
                if (this.args.type_) {
                    writer.write(": ");
                    this.args.type_.write(writer);
                }
                writer.write(" = ");
                this.args.value.write(writer);
                writer.write(";");
                break;

            case "return":
                writer.write("return");
                if (this.args.value) {
                    writer.write(" ");
                    this.args.value.write(writer);
                }
                writer.write(";");
                break;

            case "expression":
                this.args.expression.write(writer);
                writer.write(";");
                break;

            case "assignment":
                this.args.target.write(writer);
                writer.write(" = ");
                this.args.value.write(writer);
                writer.write(";");
                break;

            case "if":
                writer.write("if ");
                this.args.condition.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                this.args.then.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                if (this.args.else_) {
                    writer.write(" else {");
                    writer.newLine();
                    writer.indent();
                    this.args.else_.forEach(stmt => {
                        stmt.write(writer);
                        writer.newLine();
                    });
                    writer.dedent();
                    writer.write("}");
                }
                break;

            case "match": {
                const matchArgs = this.args as Extract<Statement.Args, { type: "match" }>;
                writer.write("match ");
                matchArgs.expression.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                matchArgs.arms.forEach((arm, index) => {
                    writer.write(arm.pattern);
                    if (arm.guard) {
                        writer.write(" if ");
                        arm.guard.write(writer);
                    }
                    writer.write(" => {");
                    writer.newLine();
                    writer.indent();
                    arm.body.forEach(stmt => {
                        stmt.write(writer);
                        writer.newLine();
                    });
                    writer.dedent();
                    writer.write("}");
                    if (index < matchArgs.arms.length - 1) {
                        writer.write(",");
                    }
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

            case "while":
                writer.write("while ");
                this.args.condition.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                this.args.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;

            case "for":
                writer.write("for ");
                writer.write(this.args.pattern);
                writer.write(" in ");
                this.args.iterable.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                this.args.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;

            case "raw":
                writer.write(this.args.value);
                break;
        }
    }

    // Factory methods
    public static let(args: { name: string; value: Expression; mutable?: boolean; type_?: Type }): Statement {
        return new Statement({ type: "let", ...args });
    }

    public static return(value?: Expression): Statement {
        return new Statement({ type: "return", value });
    }

    public static expression(expression: Expression): Statement {
        return new Statement({ type: "expression", expression });
    }

    public static assignment(target: Expression, value: Expression): Statement {
        return new Statement({ type: "assignment", target, value });
    }

    public static if(condition: Expression, then: Statement[], else_?: Statement[]): Statement {
        return new Statement({ type: "if", condition, then, else_ });
    }

    public static match(expression: Expression, arms: Statement.MatchArm[]): Statement {
        return new Statement({ type: "match", expression, arms });
    }

    public static while(condition: Expression, body: Statement[]): Statement {
        return new Statement({ type: "while", condition, body });
    }

    public static for(pattern: string, iterable: Expression, body: Statement[]): Statement {
        return new Statement({ type: "for", pattern, iterable, body });
    }

    public static raw(value: string): Statement {
        return new Statement({ type: "raw", value });
    }
} 