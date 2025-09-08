import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Identifier } from "./Identifier";

export declare namespace Switch {
    interface Args {
        /* The expression to switch on */
        on: AstNode;
        /* The cases of the switch */
        cases: Case[];
        /* The default case, if any */
        default?: AstNode;
    }

    interface Case {
        on: AstNode;
        body: AstNode;
    }
}

export class Switch extends AstNode {
    public readonly on: AstNode;
    public readonly cases: Switch.Case[];
    public readonly default: AstNode | undefined;

    constructor({ on, cases, default: default_ }: Switch.Args) {
        super();
        this.on = on;
        this.cases = cases;
        this.default = default_;
    }

    public write(writer: Writer): void {
        const cases = this.cases;
        if (this.default != null) {
            cases.push({
                on: new Identifier("default"),
                body: this.default
            });
        }
        writer.write("switch ");
        writer.writeNode(this.on);
        writer.writeLine("{");
        writer.indent();
        for (const case_ of cases) {
            writer.write("case ");
            writer.writeNode(case_.on);
            writer.writeLine(":");
            writer.indent();
            writer.writeNode(case_.body);
            writer.dedent();
            writer.writeNewLineIfLastLineNot();
        }
        writer.dedent();
        writer.write("}");
    }
}
