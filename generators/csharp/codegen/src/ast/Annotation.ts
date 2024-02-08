import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

export declare namespace Annotation {
    interface Args {
        /* Reference to the annotation */
        reference: string;

        arguments: string[];
    }
}

/* A C# annotation */
export class Annotation extends AstNode {
    constructor(private readonly args: Annotation.Args) {
        super();
    }

    protected write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
