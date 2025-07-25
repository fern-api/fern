import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Expression } from "./Expression";
import { Type } from "./Type";
import { Pattern } from "./Pattern";
import { MatchArm } from "./MatchArm";

export declare namespace Statement {
    type Args =
        | { type: "let"; name: string; value: Expression; mutable?: boolean; type_?: Type }
        | { type: "return"; value?: Expression }
        | { type: "expression"; expression: Expression }
        | { type: "assignment"; target: Expression; value: Expression }
        | { type: "if"; condition: Expression; then: Statement[]; else_?: Statement[] }
        | { type: "if-let"; pattern: string; value: Expression; then: Statement[]; else_?: Statement[] }
        | { type: "match"; expression: Expression; arms: MatchArm[] }
        | { type: "match-enhanced"; expression: Expression; arms: import("./MatchArm").MatchArm[] }
        | { type: "while"; condition: Expression; body: Statement[] }
        | { type: "while-let"; pattern: string; value: Expression; body: Statement[] }
        | { type: "for"; pattern: string; iterable: Expression; body: Statement[] }
        | { type: "loop"; body: Statement[] }
        | { type: "break"; label?: string; value?: Expression }
        | { type: "continue"; label?: string }
        | { type: "unsafe"; body: Statement[] }
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

            case "if": {
                const ifArgs = this.args as Extract<Statement.Args, { type: "if" }>;
                writer.write("if ");
                ifArgs.condition.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                ifArgs.then.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                if (ifArgs.else_) {
                    writer.write(" else {");
                    writer.newLine();
                    writer.indent();
                    ifArgs.else_.forEach(stmt => {
                        stmt.write(writer);
                        writer.newLine();
                    });
                    writer.dedent();
                    writer.write("}");
                }
                break;
            }

            case "if-let": {
                const ifLetArgs = this.args as Extract<Statement.Args, { type: "if-let" }>;
                writer.write("if let ");
                writer.write(ifLetArgs.pattern);
                writer.write(" = ");
                ifLetArgs.value.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                ifLetArgs.then.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                if (ifLetArgs.else_) {
                    writer.write(" else {");
                    writer.newLine();
                    writer.indent();
                    ifLetArgs.else_.forEach(stmt => {
                        stmt.write(writer);
                        writer.newLine();
                    });
                    writer.dedent();
                    writer.write("}");
                }
                break;
            }

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

            case "match-enhanced": {
                const matchArgs = this.args as Extract<Statement.Args, { type: "match-enhanced" }>;
                writer.write("match ");
                matchArgs.expression.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                matchArgs.arms.forEach(arm => {
                    arm.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

            case "while": {
                const whileArgs = this.args as Extract<Statement.Args, { type: "while" }>;
                writer.write("while ");
                whileArgs.condition.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                whileArgs.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

            case "while-let": {
                const whileLetArgs = this.args as Extract<Statement.Args, { type: "while-let" }>;
                writer.write("while let ");
                writer.write(whileLetArgs.pattern);
                writer.write(" = ");
                whileLetArgs.value.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                whileLetArgs.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

            case "for": {
                const forArgs = this.args as Extract<Statement.Args, { type: "for" }>;
                writer.write("for ");
                writer.write(forArgs.pattern);
                writer.write(" in ");
                forArgs.iterable.write(writer);
                writer.write(" {");
                writer.newLine();
                writer.indent();
                forArgs.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

            case "loop": {
                const loopArgs = this.args as Extract<Statement.Args, { type: "loop" }>;
                writer.write("loop {");
                writer.newLine();
                writer.indent();
                loopArgs.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

            case "break": {
                const breakArgs = this.args as Extract<Statement.Args, { type: "break" }>;
                writer.write("break");
                if (breakArgs.label) {
                    writer.write(" '");
                    writer.write(breakArgs.label);
                }
                if (breakArgs.value) {
                    writer.write(" ");
                    breakArgs.value.write(writer);
                }
                writer.write(";");
                break;
            }

            case "continue": {
                const continueArgs = this.args as Extract<Statement.Args, { type: "continue" }>;
                writer.write("continue");
                if (continueArgs.label) {
                    writer.write(" '");
                    writer.write(continueArgs.label);
                }
                writer.write(";");
                break;
            }

            case "unsafe": {
                const unsafeArgs = this.args as Extract<Statement.Args, { type: "unsafe" }>;
                writer.write("unsafe {");
                writer.newLine();
                writer.indent();
                unsafeArgs.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
                writer.write("}");
                break;
            }

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

    public static matchEnhanced(expression: Expression, arms: import("./MatchArm").MatchArm[]): Statement {
        return new Statement({ type: "match-enhanced", expression, arms });
    }

    public static while(condition: Expression, body: Statement[]): Statement {
        return new Statement({ type: "while", condition, body });
    }

    public static for(pattern: string, iterable: Expression, body: Statement[]): Statement {
        return new Statement({ type: "for", pattern, iterable, body });
    }

    public static ifLet(pattern: string, value: Expression, then: Statement[], else_?: Statement[]): Statement {
        return new Statement({ type: "if-let", pattern, value, then, else_ });
    }

    public static whileLet(pattern: string, value: Expression, body: Statement[]): Statement {
        return new Statement({ type: "while-let", pattern, value, body });
    }

    public static loop(body: Statement[]): Statement {
        return new Statement({ type: "loop", body });
    }

    public static break(label?: string, value?: Expression): Statement {
        return new Statement({ type: "break", label, value });
    }

    public static continue(label?: string): Statement {
        return new Statement({ type: "continue", label });
    }

    public static unsafe(body: Statement[]): Statement {
        return new Statement({ type: "unsafe", body });
    }

    public static raw(value: string): Statement {
        return new Statement({ type: "raw", value });
    }
} 