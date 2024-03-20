import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Field } from "./Field";

export declare namespace ClassInstantiation {
    interface Args {
        classReference: ClassReference;
        // A map of the field for the class and the value to be assigned to it.
        arguments_: Map<Field, CodeBlock>;
    }
}

export class ClassInstantiation extends AstNode {
    public readonly classReference: ClassReference;
    public readonly arguments: Map<Field, CodeBlock>;

    constructor({ classReference, arguments_ }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments = arguments_;
    }

    public write(writer: Writer): void {
        writer.write(`new ${this.classReference.name}(`);

        writer.indent();
        [...this.arguments.entries()].forEach(([field, assignment], idx) => {
            writer.write(`${field.name}: `);
            assignment.write(writer);
            if (idx < this.arguments.size - 1) {
                writer.write(", ");
            }
        });
        writer.dedent();

        writer.write(")");
    }
}
