import { AstNode, Writer } from "./core";

export declare namespace Comment {
    interface Args {
        content: string;
    }
}

export class Comment extends AstNode {
    private readonly content: string;

    public constructor({ content }: Comment.Args) {
        super();
        this.content = content;
    }

    public write(writer: Writer): void {
        const lines = this.content.split("\n");
        lines.forEach((line) => {
            writer.write(`// ${line}`);
            writer.newLine();
        });
    }
}
