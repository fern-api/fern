import { AbstractAstNode, CodeBlock as CommonCodeBlock } from "@fern-api/generator-commons";
import { Writer } from "./Writer";

export declare namespace CodeBlock {
    /* Write arbitrary code */
    type Args = CommonCodeBlock.Arg<Writer>;
}

export class CodeBlock extends AbstractAstNode {
    public constructor(private readonly arg: CodeBlock.Args) {
        super();
    }

    public write(writer: Writer): void {
        const commonCodeBlock = new CommonCodeBlock(this.arg);
        return commonCodeBlock.write(writer);
    }
}
