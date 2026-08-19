import { type Generation } from "../../context/generation-info.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";

export declare namespace Switch {
    interface Args {
        /* The condition to switch on */
        condition: AstNode;
        /* The cases of the switch statement */
        cases: Case[];
    }

    interface Case {
        /* The label used to determine if the case is a match */
        label: AstNode;
        /* The value if the case is a match */
        value: AstNode;
    }
}

export class Switch extends AstNode {
    private condition: AstNode;
    private cases: Switch.Case[];

    constructor({ condition, cases }: Switch.Args, generation: Generation) {
        super(generation);

        this.condition = condition;
        this.cases = cases;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.condition);
        writer.write(" switch");
        writer.pushScope();
        for (const { label, value } of this.cases) {
            writer.writeNode(label);
            writer.write(" => ");
            writer.writeNode(value);
            writer.writeLine(",");
        }
        writer.popScope();
    }
}
