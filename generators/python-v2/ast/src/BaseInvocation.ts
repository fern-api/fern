import { MethodArgument } from "./MethodArgument";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace BaseInvocation {
    interface Args {
        /* A reference to the callable that you'd like to invoke */
        reference: Reference;
        /* The arguments to pass to the method */
        arguments_: MethodArgument[];
    }
}

export class BaseInvocation extends AstNode {
    protected reference: Reference;
    private arguments: MethodArgument[];

    constructor({ reference, arguments_ }: BaseInvocation.Args) {
        super();

        this.reference = reference;
        this.arguments = arguments_;

        this.inheritReferences(reference);
        this.arguments.forEach((arg) => {
            this.inheritReferences(arg);
        });
    }

    public write(writer: Writer): void {
        this.reference.write(writer);
        writer.write("(");

        this.arguments.forEach((arg, idx) => {
            arg.write(writer);
            if (idx < this.arguments.length - 1) {
                writer.write(", ");
            }
        });

        writer.write(")");
    }
}
