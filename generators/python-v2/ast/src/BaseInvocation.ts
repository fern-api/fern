import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { MethodArgument } from "./MethodArgument";
import { Reference } from "./Reference";

export declare namespace BaseInvocation {
    interface Args {
        /* A reference to the callable that you'd like to invoke */
        reference: Reference;
        /* The arguments to pass to the method */
        arguments_: MethodArgument[];
        /* Whether to write the invocation on a new line */
        multiline?: boolean;
    }
}

export class BaseInvocation extends AstNode {
    protected reference: Reference;
    private arguments: MethodArgument[];
    private multiline: boolean;

    constructor({ reference, arguments_, multiline }: BaseInvocation.Args) {
        super();

        this.reference = reference;
        this.arguments = arguments_;
        this.multiline = multiline ?? false;

        this.inheritReferences(reference);
        this.arguments.forEach((arg) => {
            this.inheritReferences(arg);
        });
    }

    public write(writer: Writer): void {
        this.reference.write(writer);

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
