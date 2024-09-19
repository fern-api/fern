import { AstNode } from "./core/AstNode";
import { Arguments } from "@fern-api/generator-commons";
import { Writer } from "./core/Writer";
import { writeArguments } from "./utils/writeArguments";

export declare namespace MethodInvocation {
    interface Args {
        /* The method to invoke */
        method: string;
        /* The arguments passed to the method */
        arguments_: Arguments;
        /* In the event of an instance method, you'll want to invoke it on said instance */
        on?: AstNode;
        /* Write the invocation across multiple lines */
        multiline?: boolean;
    }
}

export class MethodInvocation extends AstNode {
    private method: string;
    private arguments_: Arguments;
    private multiline: boolean;
    private on: AstNode | undefined;

    constructor({ method, arguments_, multiline, on }: MethodInvocation.Args) {
        super();

        this.method = method;
        this.arguments_ = arguments_;
        this.multiline = multiline ?? false;
        this.on = on;
    }

    public write(writer: Writer): void {
        if (this.on != null) {
            this.on.write(writer);
            writer.write("->");
        }
        writer.write(this.method);
        writeArguments({ writer, arguments_: this.arguments_, multiline: this.multiline });
    }
}
