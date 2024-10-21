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
        /* The parent object that the invoked method lives within, if any */
        methodParent?: AstNode;
    }
}

export class MethodInvocation extends AstNode {
    private methodName: string;
    private arguments: MethodArgument[];
    private methodParent?: AstNode;

    constructor({ method, arguments_, methodParent }: MethodInvocation.Args) {
        super();

        this.methodName = typeof method === "string" ? method : method.getName();
        this.arguments = arguments_;
        this.methodParent = methodParent;

        this.arguments.forEach((arg) => {
            this.inheritReferences(arg);
        });
        if (this.methodParent) {
            this.inheritReferences(this.methodParent);
        }
    }

    public write(writer: Writer): void {
        if (this.methodParent) {
            this.methodParent.write(writer);
            writer.write(".");
        }

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
