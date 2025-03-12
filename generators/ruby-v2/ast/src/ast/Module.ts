import { Class_ } from "./Class";
import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Module {
    export interface Args {
        /* The module's name. */
        name: string;
        /* This module's namespace (i.e., the modules/classes it is wrapped in). */
        namespace?: (Module | Class_)[];
        /* The docstring for the module. */
        docstring?: string;
        /* The body of the module. */
        statements?: AstNode[];
    }
}

export class Module extends AstNode {
    public readonly name: string;
    public readonly namespace: (Module | Class_)[];
    public readonly docstring: string | undefined;
    public readonly statements: AstNode[];

    constructor({ name, namespace, docstring, statements }: Module.Args) {
        super();

        this.name = name;
        this.namespace = namespace ?? [];
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

    public get fullyQualifiedName(): string {
        return [...this.namespace, this].map((klass) => klass.name).join("::");
    }
}
