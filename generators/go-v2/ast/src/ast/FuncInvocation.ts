import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { GoTypeReference } from "./GoTypeReference.js";
import { writeArguments } from "./utils/writeArguments.js";

export declare namespace FuncInvocation {
    interface Args {
        /* The function to invoke */
        func: GoTypeReference;
        /* The arguments passed to the method */
        arguments_: AstNode[];
        /* Whether to write the invocation on multiple lines */
        multiline?: boolean;
    }
}

export class FuncInvocation extends AstNode {
    private func: GoTypeReference;
    private arguments_: AstNode[];
    private multiline: boolean | undefined;

    constructor({ func, arguments_, multiline = true }: FuncInvocation.Args) {
        super();

        this.func = func;
        this.arguments_ = arguments_;
        this.multiline = multiline;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.func);
        writeArguments({ writer, arguments_: this.arguments_, multiline: this.multiline });
    }
}
