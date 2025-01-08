import { Comment } from "./Comment";
import { Field } from "./Field";
import { Method } from "./Method";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Struct {
    interface Args {
        /* The name of the Go struct */
        name: string;
        /* The import path of the Go struct */
        importPath: string;
        /* Docs associated with the class */
        docs?: string;
    }
}

export class Struct extends AstNode {
    public readonly name: string;
    public readonly importPath: string;
    public readonly docs: string | undefined;

    public readonly fields: Field[] = [];
    public readonly methods: Method[] = [];

    constructor({ name, importPath, docs }: Struct.Args) {
        super();
        this.name = name;
        this.importPath = importPath;
        this.docs = docs;
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`type ${this.name} struct {`);
        if (this.fields.length > 0) {
            writer.writeLine("}");
        } else {
            writer.newLine();
            writer.indent();
            for (const field of this.fields) {
                writer.writeNode(field);
                writer.newLine();
            }
            writer.dedent();
            writer.writeLine("}");
        }
        if (this.constructor != null || this.methods.length > 0) {
            writer.newLine();
        }
        for (const method of this.methods) {
            writer.writeNode(method);
            writer.newLine();
        }
        return;
    }
}
