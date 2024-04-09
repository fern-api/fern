import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: Type;
        /* Docs for the parameter */
        docs: string | undefined;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly docs: string | undefined;
    private type: Type;

    constructor({ name, type, docs }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        this.type.write(writer);
        writer.write(` ${this.name}`);
    }
}
