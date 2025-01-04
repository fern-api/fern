import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace FunctionInvocation {
    interface Args {
        function_: Reference;
        arguments_: AstNode[];
    }
}

export class FunctionInvocation extends AstNode {
    private function_: Reference;
    private arguments_: AstNode[];

    constructor({ function_, arguments_ }: FunctionInvocation.Args) {
        super();
        this.function_ = function_;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.function_);
        writer.write("(");
        writer.delimit({
            nodes: this.arguments_,
            delimiter: ", ",
            writeFunction: (argument) => argument.write(writer)
        });
        writer.write(")");
    }
}
