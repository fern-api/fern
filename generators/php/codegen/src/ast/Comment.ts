import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { convertToPhpVariableName } from "./utils/convertToPhpVariableName";

export type TagType = "param" | "return" | "throws" | "var";

export const TagType = {
    Param: "param",
    Returns: "return",
    Throws: "throws",
    Var: "var"
} as const;

export declare namespace Comment {
    interface Args {
        /* The preface docs of the comment, if any */
        docs?: string;
    }

    interface Tag {
        /* The type of the comment tag (e.g. @param) */
        tagType: TagType;
        /* The type included in the @<tag> comment */
        type: Type;
        /* The name of the variable in the @<tag> comment, if any */
        name?: string;
        /* The in-line docs associated with the type, if any */
        docs?: string;
    }
}

export class Comment extends AstNode {
    public readonly docs: string | undefined;

    private tags: Comment.Tag[] = [];

    constructor({ docs }: Comment.Args = {}) {
        super();
        this.docs = docs;
    }

    public addTag(tag: Comment.Tag): void {
        this.tags.push({
            ...tag,
            name: tag.name != null ? convertToPhpVariableName(tag.name) : undefined
        });
    }

    public write(writer: Writer): void {
        writer.writeLine("/**");
        if (this.docs != null) {
            this.docs.split("\n").forEach((line) => {
                writer.writeLine(` * ${line}`);
            });
            if (this.tags.length > 0) {
                writer.writeLine(" *");
            }
        }
        for (const tag of this.tags) {
            this.writeTag({ writer, tag });
        }
        writer.writeLine(" */");
    }

    private writeTag({ writer, tag }: { writer: Writer; tag: Comment.Tag }): void {
        writer.write(` * @${tag.tagType} `);
        tag.type.write(writer, { comment: true });
        if (tag.name != null) {
            writer.write(` ${tag.name}`);
        }
        if (tag.docs != null) {
            writer.write(` ${tag.docs}`);
        }
        writer.newLine();
    }
}
