import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Decorator } from "./Decorator";
import { Field } from "./Field";

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
    public readonly fields: Field[] = [];
    private statements: AstNode[] = [];

    constructor({ name, extends_, decorators }: Class.Args) {
        super();
        this.name = name;
        this.extends_ = extends_ ?? [];
        this.decorators = decorators ?? [];

        this.extends_.forEach((parentClassReference) => {
            this.addReference(parentClassReference);
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

    public addStatement(statement: AstNode): void {
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
        this.addStatement(field);
    }
}
