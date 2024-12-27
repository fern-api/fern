import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Comment {
    interface Args {
        docs: string | undefined;
    }
}

export class Comment extends AstNode {
    public readonly docs: string | undefined;

    constructor({ docs }: Comment.Args = { docs: undefined }) {
        super();
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            writer.writeLine("/**");
            this.docs.split("\n").forEach((line) => {
                writer.writeLine(` * ${line}`);
            });
            writer.writeLine("*/");
        }
    }
}
