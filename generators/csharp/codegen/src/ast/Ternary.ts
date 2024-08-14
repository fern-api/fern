import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Ternary {
    interface Args {
        /* The condition to check */
        condition: AstNode;
        /* The truth statement */
        trueStatement: AstNode;
        /* The false statement */
        falseStatement: AstNode;
    }
}

export class Ternary extends AstNode {
    private condition: AstNode;
    private trueStatement: AstNode;
    private falseStatement: AstNode;

    constructor({ condition, trueStatement, falseStatement }: Ternary.Args) {
        super();

        this.condition = condition;
        this.trueStatement = trueStatement;
        this.falseStatement = falseStatement;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.condition);
        writer.write(" ? ");
        writer.writeNode(this.trueStatement);
        writer.write(" : ");
        writer.writeNode(this.falseStatement);
    }
}
