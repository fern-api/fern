import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Or {
    interface Args {
        // The conditions to combine into a single condition */
        conditions: AstNode[];
    }
}

export class Or extends AstNode {
    private conditions: AstNode[];

    constructor(args: Or.Args) {
        super();
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
