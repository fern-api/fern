import { CodeBlock as CommonCodeBlock } from "@fern-api/browser-compatible-base-generator";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace CodeBlock {
    /* Write arbitrary code */
    type Args = CommonCodeBlock.Arg<Writer>;
}

export class CodeBlock extends AstNode {
    private args: CodeBlock.Args;

    public constructor(args: CodeBlock.Args) {
        super();
        this.args = args;
    }

    public write(writer: Writer): void {
        const commonCodeBlock = new CommonCodeBlock(this.args);
        return commonCodeBlock.write(writer);
    }
}
