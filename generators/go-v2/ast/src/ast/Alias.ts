import { Comment } from "./Comment.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Type } from "./Type.js";

export declare namespace Alias {
    interface Args {
        /* The name of the alias */
        name: string;
        /* The type of the alias */
        type: Type;
        /* The docs of the alias, if any */
        docs?: string;
    }
}

export class Alias extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly docs: string | undefined;

    constructor({ name, type, docs }: Alias.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write("type ");
        writer.write(this.name);
        writer.write(" = ");
        writer.writeNode(this.type);
    }
}
