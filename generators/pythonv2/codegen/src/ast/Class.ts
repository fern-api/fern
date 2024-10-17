import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Field } from "./Field";
import { CodeBlock } from "./CodeBlock";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
        /* The parent classes that this class inherits from */
        extends_?: Reference[];
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly extends_: Reference[];
    private fields: Field[] = [];
    private body?: CodeBlock;

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
        let hasContents = false;
        if (this.fields.length) {
            this.writeFields({ writer });
            hasContents = true;
        }
        if (this.body) {
            this.body.write(writer);
            hasContents = true;
        }
        if (!hasContents) {
            writer.write("pass");
        }
        writer.dedent();
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addBody(body: CodeBlock): void {
        this.body = body;
    }

    private writeFields({ writer }: { writer: Writer }): void {
        this.fields.forEach((field, index) => {
            field.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
    }
}
