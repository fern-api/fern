import { ClassReference } from "./ClassReference";
import { Comment } from "./Comment";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Method, MethodKind } from "./Method";
import { Module_ } from "./Module";
import { Type } from "./Type";

export declare namespace Class_ {
    export interface Args extends Module_.Args {
        /* The superclass of this class. */
        superclass?: ClassReference;
    }
}

export class Class_ extends Module_ {
    public readonly superclass: ClassReference | undefined;
    public readonly statements: AstNode[];
    public readonly methods: Method[] = [];

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

    public addInstanceMethod(name: string, returnType: Type, statements: AstNode[]): void {
        const method = new Method({
            name,
            kind: MethodKind.Instance,
            returnType,
            statements
        });
        this.addMethod(method);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public addMethods(methods: Method[]): void {
        methods.forEach((method) => this.addMethod(method));
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

        if (!this.hasBody()) {
            writer.write("; end");
            return;
        }

        if (this.statements.length) {
            writer.newLine();
            writer.indent();

            this.statements.forEach((statement, index) => {
                statement.write(writer);
                writer.newLine();
            });

            writer.dedent();
        }

        if (this.methods.length) {
            writer.newLine();
            writer.indent();
            this.methods.forEach((method) => {
                method.write(writer);
            });
            writer.dedent();
        }

        writer.write("end");
        writer.newLine();
    }

    private hasBody(): boolean {
        return this.statements.length > 0 || this.methods.length > 0;
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
