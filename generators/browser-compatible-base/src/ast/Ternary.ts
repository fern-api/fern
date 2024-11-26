import { AbstractAstNode } from "./AbstractAstNode";
import { AbstractWriter } from "./AbstractWriter";

export declare namespace Ternary {
    interface Args {
        /* The condition to check */
        condition: AbstractAstNode;
        /* The true expression */
        true_: AbstractAstNode;
        /* The false expression */
        false_: AbstractAstNode;
    }
}

export class Ternary extends AbstractAstNode {
    private condition: AbstractAstNode;
    private true_: AbstractAstNode;
    private false_: AbstractAstNode;

    constructor({ condition, true_, false_ }: Ternary.Args) {
        super();

        this.condition = condition;
        this.true_ = true_;
        this.false_ = false_;
    }

    public write(writer: AbstractWriter): void {
        writer.writeNode(this.condition);
        writer.write(" ? ");
        writer.writeNode(this.true_);
        writer.write(" : ");
        writer.writeNode(this.false_);
    }
}
