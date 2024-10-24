import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { MethodArgument } from "./MethodArgument";
import { Reference } from "./Reference";

export declare namespace Decorator {
    interface Args {
        /* The reference to the decorator function or class */
        reference: Reference | string;
        /* Optional arguments for the decorator */
        args?: MethodArgument[];
    }
}

export class Decorator extends AstNode {
    private reference: Reference | string;
    private args: AstNode[];

    constructor({ reference, args }: Decorator.Args) {
        super();
        this.reference = reference;
        this.args = args ?? [];
    }

    public write(writer: Writer): void {
        writer.write("@");

        if (typeof this.reference === "string") {
            writer.write(this.reference);
        } else {
            this.reference.write(writer);
            this.addReference(this.reference);
        }

        if (this.args.length > 0) {
            writer.write("(");
            this.args.forEach((arg, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                arg.write(writer);
            });
            writer.write(")");
        }
        writer.newLine();
    }
}
