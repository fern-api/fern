import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Field } from "./Field";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
    }
}

export class Class extends AstNode {
    public readonly name: string;

    private fields: Field[] = [];

    constructor({ name }: Class.Args) {
        super();
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.write(`class ${this.name}:`);
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
