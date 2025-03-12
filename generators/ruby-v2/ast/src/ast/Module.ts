import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Module {
    export interface Args {
        /* The class's name. */
        name: string;
        /* The docstring for the class. */
        docstring?: string;
        /* The body of the class. */
        statements?: AstNode[];
    }
}

export class Module extends AstNode {
    public readonly name: string;
    public readonly docstring: string | undefined;
    public readonly statements: AstNode[];

    constructor({ name, docstring, statements }: Module.Args) {
        super();

        this.name = name;
        this.docstring = docstring;
        this.statements = statements ?? [];
    }

    public write(writer: Writer): void {
        if (this.docstring) {
            new Comment({ docs: this.docstring }).write(writer);
        }

        writer.write(`module ${this.name}`);

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
        writer.write(`module ${this.name}`);
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
