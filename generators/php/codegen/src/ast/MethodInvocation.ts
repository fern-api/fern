import { Arguments } from "@fern-api/base-generator";

import { AstNode } from "./core/AstNode";
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
        /* If the method is static */
        static_?: boolean;
        /* Write the invocation across multiple lines */
        multiline?: boolean;
    }
}

export class MethodInvocation extends AstNode {
    private method: string;
    private arguments_: Arguments;
    private multiline: boolean;
    private static_: boolean;
    private on: AstNode | undefined;

    constructor({ method, arguments_, static_, multiline, on }: MethodInvocation.Args) {
        super();

        this.method = method;
        this.arguments_ = arguments_;
        this.static_ = static_ ?? false;
        this.multiline = multiline ?? false;
        this.on = on;
    }

    public write(writer: Writer): void {
        if (this.on != null) {
            this.on.write(writer);
            writer.write(this.getMethodAccessor());
        }
        writer.write(this.method);
        writeArguments({ writer, arguments_: this.arguments_, multiline: this.multiline });
    }

    private getMethodAccessor(): string {
        return this.static_ ? "::" : "->";
    }
}
