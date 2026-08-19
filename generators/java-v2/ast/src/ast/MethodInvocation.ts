import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { writeArguments } from "./utils/writeArguments.js";

export declare namespace MethodInvocation {
    interface Args {
        /* The instance to invoke the method on */
        on: AstNode;
        /* The method to invoke */
        method: string;
        /* The arguments passed to the method */
        arguments_: AstNode[];
    }
}

export class MethodInvocation extends AstNode {
    private on: AstNode;
    private method: string;
    private arguments_: AstNode[];

    constructor({ method, arguments_, on }: MethodInvocation.Args) {
        super();

        this.on = on;
        this.method = method;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        this.on.write(writer);
        writer.write(".");
        writer.write(this.method);
        writeArguments({ writer, arguments_: this.arguments_ });
    }
}
