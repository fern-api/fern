import { Comment } from "./Comment.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Type } from "./Type.js";

export declare namespace Parameter {
    interface Args {
        name: string;
        type: Type;
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
        if (this.docs != null) {
            writer.writeNode(new Comment({ docs: this.docs }));
        }
        writer.write(`${this.name}: `);
        this.type.write(writer);
    }
}
