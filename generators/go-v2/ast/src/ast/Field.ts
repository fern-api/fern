import { Comment } from "./Comment";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* The docs of the field, if any */
        docs?: string;
        /* The tags of the field, if any */
        tags?: Tag[];
    }

    interface Tag {
        /* The name of the tag */
        name: string;
        /* The value of the tag */
        value: string;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;

    private docs: string | undefined;
    private tags: Field.Tag[] = [];

    constructor({ name, type, docs, tags }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.docs = docs;
        this.tags = tags ?? [];
    }

    public addTags(...tags: Field.Tag[]): void {
        this.tags.push(...tags);
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write(`${this.name} `);
        this.type.write(writer);
        this.writeTags({ writer });
    }

    private writeTags({ writer }: { writer: Writer }): void {
        if (this.tags.length === 0) {
            return;
        }
        writer.write(" `");
        this.tags.forEach((tag, index) => {
            if (index > 0) {
                writer.write(" ");
            }
            writer.write(`${tag.name}:"${tag.value}"`);
        });
        writer.write("`");
    }
}
