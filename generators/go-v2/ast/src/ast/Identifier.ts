import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Identifier {
    type Args = string;
}

export class Identifier extends AstNode {
    public readonly name: string;

    constructor(name: Identifier.Args) {
        super();
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
    }
}
