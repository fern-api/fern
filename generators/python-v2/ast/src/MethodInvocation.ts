import { MethodArgument } from "./MethodArgument";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        /* The reference to the class instance the method is defined on */
        on: Reference;
        /* The method to invoke */
        method: string;
        /* The arguments to pass to the method */
        arguments_: MethodArgument[];
        /* Whether to write the method invocation on a new line */
        multiline?: boolean;
    }
}

export class MethodInvocation extends AstNode {
    protected on: Reference;
    private method: string;
    private arguments: MethodArgument[];
    private multiline: boolean;

    constructor({ on, method, arguments_, multiline }: MethodInvocation.Args) {
        super();

        this.on = on;
        this.method = method;
        this.arguments = arguments_;
        this.multiline = multiline ?? false;

        this.inheritReferences(on);
        this.arguments.forEach((arg) => {
            this.inheritReferences(arg);
        });
    }

    public write(writer: Writer): void {
        this.on.write(writer);
        writer.write(".");
        writer.write(this.method);

        if (this.arguments.length === 0) {
            writer.write("()");
            return;
        }

        writer.write("(");
        if (this.multiline) {
            writer.newLine();
            writer.indent();
        }
        this.arguments.forEach((arg, idx) => {
            arg.write(writer);
            if (idx < this.arguments.length - 1) {
                writer.write(",");
                if (this.multiline) {
                    writer.newLine();
                } else {
                    writer.write(" ");
                }
            }
        });
        if (this.multiline) {
            writer.newLine();
            writer.dedent();
        }
        writer.write(")");
    }
}
