import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        on: Reference;
        method: string;
        arguments_: AstNode[];
        async?: boolean;
    }
}

export class MethodInvocation extends AstNode {
    private on: Reference;
    private method: string;
    private arguments_: AstNode[];
    private async: boolean | undefined;

    constructor({ on, method, arguments_, async }: MethodInvocation.Args) {
        super();
        this.on = on;
        this.method = method;
        this.arguments_ = arguments_;
        this.async = async;
    }

    public write(writer: Writer): void {
        if (this.async) {
            writer.write("await ");
        }
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
