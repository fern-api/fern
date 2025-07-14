import { CodeBlock as CommonCodeBlock } from "@fern-api/browser-compatible-base-generator";

import { Statement } from "./Statement";
import { AstNode, Writer } from "./core";

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
        writer.write("{");
        writer.newLine();
        writer.indent();
        commonCodeBlock.write(writer);
        writer.dedent();
        writer.write("}");
    }

    public static empty(): CodeBlock {
        return new CodeBlock(() => {});
    }

    public static withStatements(statements: Statement[]): CodeBlock {
        return new CodeBlock((writer) => {
            statements.forEach((statement) => {
                statement.write(writer);
            });
        });
    }
}
