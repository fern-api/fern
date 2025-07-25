import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Pattern } from "./Pattern";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export declare namespace MatchArm {
    interface Args {
        pattern: Pattern;
        guard?: Expression;
        body: Statement[] | Expression; // Can be statements or a single expression
        trailing_comma?: boolean;
    }
}

export class MatchArm extends AstNode {
    readonly pattern: Pattern;
    readonly guard: Expression | undefined;
    readonly body: Statement[] | Expression;
    readonly trailing_comma: boolean;

    constructor({ pattern, guard, body, trailing_comma = true }: MatchArm.Args) {
        super();
        this.pattern = pattern;
        this.guard = guard;
        this.body = body;
        this.trailing_comma = trailing_comma;
    }

    public write(writer: Writer): void {
        // Write pattern
        this.pattern.write(writer);

        // Write guard if present
        if (this.guard) {
            writer.write(" if ");
            this.guard.write(writer);
        }

        writer.write(" => ");

        // Write body
        if (Array.isArray(this.body)) {
            // Multiple statements - use block syntax
            writer.write("{");
            if (this.body.length > 0) {
                writer.newLine();
                writer.indent();
                this.body.forEach(stmt => {
                    stmt.write(writer);
                    writer.newLine();
                });
                writer.dedent();
            }
            writer.write("}");
        } else {
            // Single expression
            this.body.write(writer);
        }

        // Add trailing comma if specified
        if (this.trailing_comma) {
            writer.write(",");
        }
    }

    // Factory methods
    public static create(pattern: Pattern, guard: Expression | undefined, body: Statement[] | Expression): MatchArm {
        return new MatchArm({ pattern, guard, body });
    }

    public static withExpression(pattern: Pattern, expression: Expression, guard?: Expression): MatchArm {
        return new MatchArm({ pattern, guard, body: expression });
    }

    public static withStatements(pattern: Pattern, statements: Statement[], guard?: Expression): MatchArm {
        return new MatchArm({ pattern, guard, body: statements });
    }

    public static withoutComma(pattern: Pattern, body: Statement[] | Expression, guard?: Expression): MatchArm {
        return new MatchArm({ pattern, guard, body, trailing_comma: false });
    }
} 