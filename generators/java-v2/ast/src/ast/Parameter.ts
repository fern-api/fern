import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Type } from "./Type.js";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: Type;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly type: Type;

    constructor({ name, type }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.type);
        writer.write(` ${this.name}`);
    }
}
