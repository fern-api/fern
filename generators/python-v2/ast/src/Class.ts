import { Decorator } from "./Decorator";
import { Field } from "./Field";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
        /* Documentation string for the class */
        docs?: string;
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
    public readonly fields: Field[] = [];
    public readonly docs?: string;
    private statements: AstNode[] = [];

    constructor({ docs, name, extends_, decorators }: Class.Args) {
        super();
        this.name = name;
        this.extends_ = extends_ ?? [];
        this.decorators = decorators ?? [];
        this.docs = docs;

        this.extends_.forEach((parentClassReference) => {
            this.inheritReferences(parentClassReference);
        });

        this.decorators.forEach((decorator) => {
            this.inheritReferences(decorator);
        });
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
            });
            writer.write(")");
        }
        writer.write(":");
        writer.newLine();

        if (this.docs != null) {
            writer.write('"""');
            writer.write(this.docs);
            writer.write('"""');
        }
        writer.writeNewLineIfLastLineNot();

        writer.indent();
        this.fields.forEach((field) => {
            field.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
        writer.dedent();

        writer.indent();
        if (this.statements.length) {
            this.writeStatements({ writer });
        } else {
            writer.write("pass");
        }
        writer.dedent();
    }

    public add(statement: AstNode): void {
        this.statements.push(statement);
        this.inheritReferences(statement);
    }

    private writeStatements({ writer }: { writer: Writer }): void {
        this.statements.forEach((statement, index) => {
            statement.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
    }

    public addField(field: Field): void {
        this.add(field);
    }
}
