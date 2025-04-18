import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Comment {
    interface Args {
        /* The comment documentation, if any */
        docs?: string;
    }
}

export class Comment extends AstNode {
    public readonly docs: string | undefined;

    public constructor({ docs }: Comment.Args) {
        super();
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.split("\n").forEach((line) => {
                writer.writeLine(`# ${line}`);
            });
        }
    }
}
