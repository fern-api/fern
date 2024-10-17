import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Field } from "./Field";
import { Decorator } from "./Decorator";
import { CodeBlock } from "./CodeBlock";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
        /* The parent classes that this class inherits from */
        extends_?: Reference[];
        /* The decorators that should be applied to this class */
        decorators?: Decorator[];
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly extends_: Reference[];
    public readonly decorators: Decorator[];
    private fields: Field[] = [];
    private body?: CodeBlock;

    constructor({ name, extends_, decorators }: Class.Args) {
        super();
        this.name = name;
        this.extends_ = extends_ ?? [];
        this.decorators = decorators ?? [];
    }

    public write(writer: Writer): void {
        this.decorators.forEach((decorator) => {
            decorator.write(writer);
        });

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
