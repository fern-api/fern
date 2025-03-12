import { Comment } from "./Comment";
import { Module } from "./Module";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Class_ {
    export interface Args {
        /* The class's name. */
        name: string;
        /* The superclass of this class. */
        superclass?: Class_;
        /* The docstring for the class. */
        docstring?: string;
        /* The body of the class. */
        statements?: AstNode[];
    }
}

export class Class_ extends Module {
    public readonly superclass: Class_ | undefined;
    public readonly statements: AstNode[];

    constructor({ name, superclass, docstring, statements }: Class_.Args) {
        super({ name, docstring });

        this.superclass = superclass;
        this.statements = statements ?? [];
    }

    public write(writer: Writer): void {
        if (this.docstring) {
            new Comment({ docs: this.docstring }).write(writer);
        }

        writer.write(`class ${this.name}`);

        if (this.superclass) {
            writer.write(` < ${this.superclass.name}`);
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

        if (this.superclass) {
            writer.write(` < ${this.superclass.name}`);
        }

        writer.newLine();

        if (this.statements.length) {
            writer.indent();
            this.statements.forEach((statement, index) => {
                statement.writeTypeDefinition(writer);
                writer.newLine();
            });
            writer.dedent();
        }

        writer.write("end");
    }
}
