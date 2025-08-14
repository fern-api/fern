import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

/**
 * Represents an if-else statement in the AST.
 */
export declare namespace IfElse {

    export type If = {
        condition: AstNode;
        thenBody: AstNode[];
    };

    interface Args {
        /** The primary if clause */
        if: IfElse.If;
        /** Optional else-if clauses */
        elseIf?: IfElse.If[];
        /** The body to execute if all conditions are false (optional) */
        elseBody?: AstNode;
    }
}

export class IfElse extends AstNode {
    public readonly ifBranch: IfElse.If;
    public readonly elseIfs: IfElse.If[];
    public readonly elseBody: AstNode[] | undefined;

    constructor({ if: ifBranch, elseIf, elseBody }: IfElse.Args) {
        super();
        this.ifBranch = ifBranch;
        this.elseIfs = elseIf ?? [];
        this.elseBody = elseBody ? (Array.isArray(elseBody) ? elseBody : [elseBody]) : undefined;
    }

    public write(writer: Writer): void {
        // Write the primary if branch
        writer.write("if ");
        this.ifBranch.condition.write(writer);
        writer.writeLine();
        writer.indent();
        for (const stmt of this.ifBranch.thenBody) {
            stmt.write(writer);
            writer.writeNewLineIfLastLineNot();
        }
        writer.dedent();

        // Write else-if branches if any
        for (const elseIf of this.elseIfs) {
            writer.write("elsif ");
            elseIf.condition.write(writer);
            writer.writeLine();
            writer.indent();
            for (const stmt of elseIf.thenBody) {
                stmt.write(writer);
                writer.writeNewLineIfLastLineNot();
            }
            writer.dedent();
        }

        // Write else body if present
        if (this.elseBody && this.elseBody.length > 0) {
            writer.writeLine("else");
            writer.indent();
            for (const stmt of this.elseBody) {
                stmt.write(writer);
                writer.writeNewLineIfLastLineNot();
            }
            writer.dedent();
        }
        writer.write("end");
    }
}
