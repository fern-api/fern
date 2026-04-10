import { type Generation } from "../../context/generation-info.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";

export declare namespace Or {
    interface Args {
        // The conditions to combine into a single condition */
        conditions: AstNode[];
    }
}

export class Or extends AstNode {
    private conditions: AstNode[];

    constructor(args: Or.Args, generation: Generation) {
        super(generation);
        this.conditions = args.conditions;
    }

    public write(writer: Writer): void {
        this.conditions.forEach((condition, index) => {
            if (index > 0) {
                writer.write(" || ");
            }
            writer.writeNode(condition);
        });
    }
}
