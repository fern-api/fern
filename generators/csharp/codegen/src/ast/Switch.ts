import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

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

    constructor({ condition, cases }: Switch.Args) {
        super();

        this.condition = condition;
        this.cases = cases;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.condition);
        writer.write(" switch {");
        writer.indent();
        for (const { label, value } of this.cases) {
            writer.writeNode(label);
            writer.write(" => ");
            writer.writeNode(value);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}
