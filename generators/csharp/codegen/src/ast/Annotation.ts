import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";

export declare namespace Annotation {
    interface Args {
        /* Reference to the annotation */
        reference: ClassReference;

        argument: string;
    }
}

export class Annotation extends AstNode {
    private reference: ClassReference;
    private argument: string;

    constructor(args: Annotation.Args) {
        super();
        this.reference = args.reference;
        this.argument = args.argument;
    }

    public write(writer: Writer): void {
        writer.addReference(this.reference);
        writer.write(`${this.reference.name}(${this.argument})`);
    }
}
