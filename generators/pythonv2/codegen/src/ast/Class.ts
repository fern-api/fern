import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
    }
}

export class Class extends AstNode {
    public readonly name: string;

    constructor({ name }: Class.Args) {
        super();
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.write(`class ${this.name}:`);
    }
}
