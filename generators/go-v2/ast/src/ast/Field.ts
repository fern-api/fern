import { Comment } from "./Comment";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Field {
    export interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* The docs of the field, if any */
        docs?: string;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    private docs: string | undefined;

    constructor({ name, type, docs }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`${this.name} `);
        this.type.write(writer);

        // TODO: Add support for struct tags.
    }
}
