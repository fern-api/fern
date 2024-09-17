import { Access } from "./Access";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";
import { Comment } from "./Comment";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* The access level of the method */
        access: Access;
        /* Whether the the field is a readonly value */
        readonly_?: boolean;
        /* The initializer for the field */
        initializer?: CodeBlock;
        /* The docs (used for describing the field) */
        docs?: string;
        /* Docs included in-line */
        inlineDocs?: string;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly access: Access;
    private readonly_: boolean;
    private initializer: CodeBlock | undefined;
    private docs: string | undefined;
    private inlineDocs: string | undefined;

    constructor({ name, type, access, readonly_, initializer, docs, inlineDocs }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.access = access;
        this.readonly_ = readonly_ ?? false;
        this.initializer = initializer;
        this.docs = docs;
        this.inlineDocs = inlineDocs;
    }

    public write(writer: Writer): void {
        this.writeComment(writer);

        writer.write(`${this.access} `);
        if (this.readonly_) {
            writer.write("readonly ");
        }

        this.type.write(writer);
        writer.write(` ${this.name}`);

        if (this.initializer != null) {
            writer.write(" = ");
            this.initializer.write(writer);
        }
        writer.write(";");

        if (this.inlineDocs != null) {
            writer.write(` // ${this.inlineDocs}`);
        }
        writer.newLine();
    }

    private writeComment(writer: Writer): void {
        const comment = new Comment();
        comment.addTag({
            tagType: "var",
            type: this.type,
            name: this.name,
            docs: this.docs
        });
        comment.write(writer);
    }
}
