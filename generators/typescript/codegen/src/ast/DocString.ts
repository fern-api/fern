import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export declare namespace DocString {
    interface Opts {
        multiline?: boolean;
    }
}

export class DocString extends AstNode {
    public constructor(private readonly docs: string, private readonly opts: DocString.Opts = {}) {
        super();
    }

    public write(writer: Writer): void {
        if (this.opts.multiline || this.docs.includes("\n")) {
            return this.writeMultiLine(writer, this.docs);
        }
        writer.writeLine(`/** ${this.docs} */`);
    }

    private writeMultiLine(writer: Writer, docs: string): void {
        writer.writeLine(`/**`);
        this.docs.split("\n").forEach((line) => {
            writer.writeLine(` * ${line}`);
        });
        writer.writeLine(" */");
    }
}
