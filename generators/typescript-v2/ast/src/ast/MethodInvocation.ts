import { Method } from "./Method";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        on: Reference;
        method: string;
        arguments_: AstNode[];
    }
}

export class MethodInvocation extends AstNode {
    private on: Reference;
    private method: string;
    private arguments_: AstNode[];

    constructor({ on, method, arguments_ }: MethodInvocation.Args) {
        super();
        this.on = on;
        this.method = method;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        this.on.write(writer);
        writer.write(".");
        writer.write(this.method);
        writer.write("(");
        writer.delimit({
            nodes: this.arguments_,
            delimiter: ", ",
            writeFunction: (argument) => argument.write(writer)
        });
        writer.write(")");
    }
}
