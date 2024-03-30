import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Field } from "./Field";

export declare namespace ClassInstantiation {
    interface Args {
        classReference: ClassReference;
        // A map of the field for the class and the value to be assigned to it.
        arguments: Map<Field, CodeBlock>;
    }
}

export class ClassInstantiation extends AstNode {
    constructor(private readonly args: ClassInstantiation.Args) {
        super();
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
