import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Ternary {
    interface Args {
        /* The condition to check */
        condition: AstNode;
        /* The true expression */
        true_: AstNode;
        /* The false expression */
        false_: AstNode;
    }
}

export class Ternary extends AstNode {
    private condition: AstNode;
    private true_: AstNode;
    private false_: AstNode;

    constructor({ condition, true_, false_ }: Ternary.Args) {
        super();

        this.condition = condition;
        this.true_ = true_;
        this.false_ = false_;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.condition);
        writer.write(" ? ");
        writer.writeNode(this.true_);
        writer.write(" : ");
        writer.writeNode(this.false_);
    }
}
