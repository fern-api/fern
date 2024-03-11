import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { CodeBlock } from "./CodeBlock";
import { Method } from "./Method";
import { Parameter } from "./Parameter";

export declare namespace MethodInvocation {
    interface Args {
        /* The method to invoke */
        method: Method;
        /* A map of the field for the class and the value to be assigned to it. */
        arguments: Map<Parameter, CodeBlock>;
        /* In the event of an instance method, you'll want to invoke it on said instance */
        on?: CodeBlock;
    }
}

export class MethodInvocation extends AstNode {
    constructor(private readonly args: MethodInvocation.Args) {
        super();
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
