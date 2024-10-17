import { AstNode } from "./AstNode";
import { CodeBlock } from "./CodeBlock";
import { Writer } from "./Writer";

export class DocString extends AstNode {
    public constructor(private readonly docs: string) {
        super();
    }

    public write(writer: Writer): void {
        if (!this.docs.includes("\n")) {
            writer.writeLine(`/* ${this.docs} */`);
        } else {
            writer.writeLine(`/**`);
            this.docs.split("\n").forEach((line) => {
                writer.writeLine(` * ${line}`);
            });
            writer.writeLine(" */");
        }
    }
}
