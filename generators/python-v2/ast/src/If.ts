import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace If {
    interface ElifClause {
        condition: AstNode;
        body: AstNode[];
    }

    interface Args {
        condition: AstNode;
        body: AstNode[];
        elif?: ElifClause[];
        else_?: AstNode[];
    }
}

export class If extends AstNode {
    private readonly condition: AstNode;
    private readonly body: AstNode[];
    private readonly elif: If.ElifClause[];
    private readonly else_?: AstNode[];

    constructor({ condition, body, elif, else_ }: If.Args) {
        super();

        this.condition = condition;
        this.inheritReferences(condition);

        this.body = body;
        body.forEach((statement) => {
            this.inheritReferences(statement);
        });

        this.elif = elif ?? [];
        this.elif.forEach((elifClause) => {
            this.inheritReferences(elifClause.condition);
            elifClause.body.forEach((statement) => {
                this.inheritReferences(statement);
            });
        });

        this.else_ = else_;
        if (this.else_) {
            this.else_.forEach((statement) => {
                this.inheritReferences(statement);
            });
        }
    }

    public write(writer: Writer): void {
        // Write if statement
        writer.write("if ");
        this.condition.write(writer);
        writer.write(":");
        writer.newLine();

        // Write if body
        writer.indent();
        if (this.body.length > 0) {
            this.body.forEach((statement) => {
                statement.write(writer);
                writer.writeNewLineIfLastLineNot();
            });
        } else {
            writer.write("pass");
            writer.newLine();
        }
        writer.dedent();

        // Write elif clauses
        this.elif.forEach((elifClause) => {
            writer.write("elif ");
            elifClause.condition.write(writer);
            writer.write(":");
            writer.newLine();

            writer.indent();
            if (elifClause.body.length > 0) {
                elifClause.body.forEach((statement) => {
                    statement.write(writer);
                    writer.writeNewLineIfLastLineNot();
                });
            } else {
                writer.write("pass");
                writer.newLine();
            }
            writer.dedent();
        });

        // Write else clause
        if (this.else_ && this.else_.length > 0) {
            writer.write("else:");
            writer.newLine();

            writer.indent();
            this.else_.forEach((statement) => {
                statement.write(writer);
                writer.writeNewLineIfLastLineNot();
            });
            writer.dedent();
        }
    }
}
