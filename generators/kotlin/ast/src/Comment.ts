import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export class Comment implements AstNode {
    private constructor(private readonly content: string, private readonly isBlock: boolean) {}

    public write(writer: Writer): void {
        if (this.isBlock) {
            writer.writeLine("/**");
            const lines = this.content.split("\n");
            lines.forEach((line) => {
                writer.writeLine(` * ${line}`);
            });
            writer.writeLine(" */");
        } else {
            writer.writeLine(`// ${this.content}`);
        }
    }

    public static line(content: string): Comment {
        return new Comment(content, false);
    }

    public static docs(content: string): Comment {
        return new Comment(content, true);
    }
}
