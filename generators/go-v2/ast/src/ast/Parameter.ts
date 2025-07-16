import { Comment } from "./Comment";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: Type;
        /* The docs of the parameter, if any */
        docs?: string;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly docs: string | undefined;

    constructor({ name, type, docs }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`${this.name} `);
        this.type.write(writer);
    }
}
