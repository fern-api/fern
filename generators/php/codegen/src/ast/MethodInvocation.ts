import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MethodInvocation {
    interface Args {
        /* The method to invoke */
        method: string;
        /* The arguments passed to the method */
        arguments_: AstNode[];
        /* In the event of an instance method, you'll want to invoke it on said instance */
        on?: AstNode;
    }
}

export class MethodInvocation extends AstNode {
    private method: string;
    private arguments: AstNode[];
    private on: AstNode | undefined;

    constructor({ method, arguments_, on }: MethodInvocation.Args) {
        super();

        this.method = method;
        this.arguments = arguments_;
        this.on = on;
    }

    public write(writer: Writer): void {
        if (this.on) {
            this.on.write(writer);
            writer.write("->");
        }
        writer.write(this.method);

        writer.write("(");
        this.arguments.forEach((arg, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            arg.write(writer);
        });
        writer.write(")");
    }
}
