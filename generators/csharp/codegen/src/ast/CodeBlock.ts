import { CodeBlock as CommonCodeBlock } from "@fern-api/browser-compatible-base-generator";
import { type Writer } from "../ast";
import { type CSharp } from "../csharp";
import { AstNode } from "./core/AstNode";
export declare namespace CodeBlock {
    /* Write arbitrary code */
    type Arg = CommonCodeBlock.Arg<Writer>;
}

export class CodeBlock extends AstNode {
    private arg: CodeBlock.Arg;

    public constructor(arg: CodeBlock.Arg, csharp: CSharp) {
        super(csharp);
        this.arg = arg;
    }

    public write(writer: Writer): void {
        const commonCodeBlock = new CommonCodeBlock(this.arg);
        return commonCodeBlock.write(writer);
    }
}
