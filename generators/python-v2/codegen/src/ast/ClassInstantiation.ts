import { python } from "..";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Method } from "./Method";
import { MethodArgument } from "./MethodArgument";
import { Reference } from "./Reference";
import { BaseInvocation } from "./BaseInvocation";

export declare namespace ClassInstantiation {
    interface Args extends Omit<BaseInvocation.Args, "reference"> {
        /* A reference to the class that you'd like to instantiate */
        classReference: Reference;
    }
}

export class ClassInstantiation extends BaseInvocation {
    constructor({ classReference, ...args }: ClassInstantiation.Args) {
        super({ reference: classReference, ...args });
    }
}
