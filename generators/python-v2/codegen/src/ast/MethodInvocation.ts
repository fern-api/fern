import { python } from "..";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Method } from "./Method";
import { MethodArgument } from "./MethodArgument";

export declare namespace MethodInvocation {
    interface Args {
        /* The method to invoke */
        method: Method | string;
        /* The arguments to pass to the method */
        arguments_: MethodArgument[];
    }
}

export class MethodInvocation extends AstNode {
    private methodName: string;
    private arguments: MethodArgument[];

    constructor({ method, arguments_ }: MethodInvocation.Args) {
        super();

        this.methodName = typeof method === "string" ? method : method.getName();
        this.arguments = arguments_;
    }

    public write(writer: Writer): void {
        writer.write(this.methodName);
        writer.write("(");

        this.arguments.forEach((arg, idx) => {
            arg.write(writer);
            if (idx < this.arguments.length - 1) {
                writer.write(", ");
            }
        });

        writer.write(")");
    }
}
