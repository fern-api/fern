import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Func } from "./Func";
import { Reference } from "./Reference";

export declare namespace FunctionInvocation {
    interface Args {
        func: Reference;
        arguments_: AstNode[];
    }
}

export class FunctionInvocation extends AstNode {
    private func: Reference;
    private arguments_: AstNode[];

    constructor({ func, arguments_ }: FunctionInvocation.Args) {
        super();
        this.func = func;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.func);
        writer.write("(");
        writer.delimit({
            nodes: this.arguments_,
            delimiter: ", ",
            writeFunction: (argument) => argument.write(writer)
        });
        writer.write(")");
    }
}
