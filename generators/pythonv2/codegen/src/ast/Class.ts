import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Field } from "./Field";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
        /* The parent classes that this class inherits from */
        extends_?: ClassReference[];
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly extends_: ClassReference[];

    private fields: Field[] = [];

    constructor({ name, extends_ }: Class.Args) {
        super();
        this.name = name;
        this.extends_ = extends_ ?? [];
    }

    public write(writer: Writer): void {
        writer.write(`class ${this.name}`);

        if (this.extends_.length > 0) {
            writer.write("(");
            this.extends_.forEach((parentClassReference, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                parentClassReference.write(writer);
                writer.addReference(parentClassReference);
            });
            writer.write(")");
        }
        writer.write(":");
        writer.newLine();

        writer.indent();
        if (this.fields.length === 0) {
            writer.write("pass");
            writer.newLine();
        } else {
            this.writeFields({ writer });
        }
        writer.dedent();
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    private writeFields({ writer }: { writer: Writer }): void {
        this.fields.forEach((field, index) => {
            field.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
    }
}
