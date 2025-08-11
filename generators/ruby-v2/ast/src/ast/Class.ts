import { ClassReference } from "./ClassReference";
import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Module_ } from "./Module";

export declare namespace Class_ {
    export interface Args extends Module_.Args {
        /* The superclass of this class. */
        superclass?: ClassReference;
    }
}

export class Class_ extends Module_ {
    public readonly superclass: ClassReference | undefined;
    public readonly statements: AstNode[];

    constructor({ name, superclass, typeParameters, docstring, statements }: Class_.Args) {
        super({ name, docstring, typeParameters });

        this.superclass = superclass;
        this.statements = statements ?? [];
    }

    public addStatement(statement: AstNode): void {
        this.statements.push(statement);
    }

    public addStatements(statements: AstNode[]): void {
        this.statements.push(...statements);
    }

    public write(writer: Writer): void {
        if (this.docstring) {
            new Comment({ docs: this.docstring }).write(writer);
        }

        writer.write(`class ${this.name}`);

        if (this.superclass) {
            writer.write(" < ");
            this.superclass.write(writer);
        }

        if (this.statements.length) {
            writer.newLine();
            writer.indent();

            this.statements.forEach((statement, index) => {
                statement.write(writer);
                if (index < this.statements.length - 1) {
                    writer.newLine();
                }
            });

            writer.dedent();
            writer.write("end");
        } else {
            writer.write("; end");
        }
        writer.newLine();
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(`class ${this.name}`);

        if (this.typeParameters.length) {
            writer.write("[");

            writer.delimit({
                nodes: this.typeParameters,
                delimiter: ", ",
                writeFunction: (argument) => argument.writeTypeDefinition(writer)
            });

            writer.write("]");
        }

        if (this.superclass) {
            writer.write(" < ");
            this.superclass.write(writer);
        }

        writer.newLine();

        if (this.statements.length) {
            writer.indent();
            this.statements.forEach((statement) => {
                statement.writeTypeDefinition(writer);
                writer.newLine();
            });
            writer.dedent();
        }

        writer.write("end");
    }
}
