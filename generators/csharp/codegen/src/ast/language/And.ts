import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

export declare namespace And {
    interface Args {
        // The conditions to combine into a single condition */
        conditions: AstNode[];
    }
}

export class And extends AstNode {
    private conditions: AstNode[];

    constructor(args: And.Args, generation: Generation) {
        super(generation);
        this.conditions = args.conditions;
    }

    public write(writer: Writer): void {
        this.conditions.forEach((condition, index) => {
            if (index > 0) {
                writer.write(" && ");
            }
            writer.writeNode(condition);
        });
    }
}
