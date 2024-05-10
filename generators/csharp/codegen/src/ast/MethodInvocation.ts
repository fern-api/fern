import { ClassInstantiation } from "./ClassInstantiation";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        /* Defaults to false */
        async?: boolean;
        /* The method to invoke */
        method: string;
        /* A map of the field for the class and the value to be assigned to it. */
        arguments_: (CodeBlock | ClassInstantiation)[];
        /* In the event of an instance method, you'll want to invoke it on said instance */
        on: CodeBlock;
    }
}

export class MethodInvocation extends AstNode {
    private arguments: (CodeBlock | ClassInstantiation)[];
    private method: string;
    private on: CodeBlock | undefined;
    private async: boolean;

    constructor({ method, arguments_, on, async }: MethodInvocation.Args) {
        super();

        this.method = method;
        this.arguments = arguments_;
        this.on = on;
        this.async = async ?? false;
    }

    public write(writer: Writer): void {
        if (this.async) {
            writer.write("await ");
        }
        if (this.on) {
            this.on.write(writer);
            writer.write(".");
        }
        writer.write(`${this.method}(`);

        writer.indent();
        this.arguments.forEach((arg, idx) => {
            arg.write(writer);
            if (idx < this.arguments.length - 1) {
                writer.write(", ");
            }
        });
        writer.dedent();

        writer.write(")");
    }
}
