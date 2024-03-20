import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { CodeBlock } from "./CodeBlock";
import { Method } from "./Method";
import { Parameter } from "./Parameter";

export declare namespace MethodInvocation {
    interface Args {
        /* The method to invoke */
        method: Method;
        /* A map of the field for the class and the value to be assigned to it. */
        arguments_: Map<Parameter, CodeBlock>;
        /* In the event of an instance method, you'll want to invoke it on said instance */
        on?: CodeBlock;
    }
}

export class MethodInvocation extends AstNode {
    private arguments: Map<Parameter, CodeBlock>;
    private method: Method;
    private on: CodeBlock | undefined;

    constructor({ method, arguments_, on }: MethodInvocation.Args) {
        super();

        this.method = method;
        this.arguments = arguments_;
        this.on = on;
    }

    public write(writer: Writer): void {
        if (this.method.isAsync) {
            writer.write("await ");
        }
        if (this.on) {
            this.on.write(writer);
            writer.write(".");
        }
        writer.write(`${this.method.name}(`);

        writer.indent();
        [...this.arguments.entries()].forEach(([parameter, assignment], idx) => {
            parameter.write(writer);
            assignment.write(writer);
            if (idx < this.arguments.size - 1) {
                writer.write(", ");
            }
        });
        writer.dedent();

        writer.write(")");
    }
}
