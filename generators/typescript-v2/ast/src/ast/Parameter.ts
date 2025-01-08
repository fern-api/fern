import { Comment } from "./Comment";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

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
        writer.write(`${this.name}`);
    }

    public writeWithType(writer: Writer): void {
        if (this.docs != null) {
            writer.writeNode(new Comment({ docs: this.docs }));
        }
        writer.write(`${this.name}: `);
        this.type.write(writer);
    }
}
