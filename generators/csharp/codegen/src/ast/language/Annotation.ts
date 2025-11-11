import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { type ClassReference } from "../types/ClassReference";

export declare namespace Annotation {
    interface Args {
        /* Reference to the annotation */
        reference: ClassReference;

        argument?: string | AstNode;
    }
}

export class Annotation extends AstNode {
    private reference: ClassReference;
    private argument?: string | AstNode;

    constructor(args: Annotation.Args, generation: Generation) {
        super(generation);
        this.reference = args.reference;
        this.argument = args.argument;
    }

    public write(writer: Writer): void {
        writer.addReference(this.reference);
        writer.write("[");
        this.reference.writeAsAttribute(writer);
        if (this.argument != null) {
            writer.write("(");
            if (typeof this.argument === "string") {
                writer.write(this.argument);
            } else {
                this.argument.write(writer);
            }
            writer.write(")");
        }
        writer.write("]");
    }
}
