import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace CodeBlock {
    interface Args {
        /* Write arbitrary code */
        value: string | ((writer: Writer) => void);
    }
}

export class CodeBlock extends AstNode {
    private value: string | ((writer: Writer) => void);

    constructor({ value }: CodeBlock.Args) {
        super();
        this.value = value;
    }

    public write(writer: Writer): void {
        if (typeof this.value === "string") {
            writer.write(this.value);
        } else {
            this.value(writer);
        }
    }
}
