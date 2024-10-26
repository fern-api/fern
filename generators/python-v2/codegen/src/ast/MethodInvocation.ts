import { python } from "..";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Method } from "./Method";
import { MethodArgument } from "./MethodArgument";
import { Reference } from "./Reference";
import { BaseInvocation } from "./BaseInvocation";

export declare namespace MethodInvocation {
    interface Args extends Omit<BaseInvocation.Args, "reference"> {
        /* A reference to the method that you'd like to invoke */
        methodReference: Reference;
    }
}

export class MethodInvocation extends BaseInvocation {
    constructor({ methodReference, ...args }: MethodInvocation.Args) {
        super({ reference: methodReference, ...args });
    }
}
