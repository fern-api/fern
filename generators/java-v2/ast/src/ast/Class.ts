import { Access } from "./Access.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Method } from "./Method.js";

export declare namespace Class {
    interface Args {
        /* The name of the class */
        name: string;
        /* The access level of the class */
        access: Access;
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly access: Access;

    private methods: Method[] = [];

    constructor({ name, access }: Class.Args) {
        super();

        this.name = name;
        this.access = access;
    }

    public write(writer: Writer): void {
        writer.write(`${this.access} class ${this.name}`);
        if (this.isEmpty()) {
            writer.writeLine(" {}");
            return;
        }
        writer.writeLine(" {");
        writer.indent();
        for (const method of this.methods) {
            writer.writeNode(method);
            writer.newLine();
        }
        writer.dedent();
        writer.write("}");
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    private isEmpty(): boolean {
        return this.methods.length === 0;
    }
}
