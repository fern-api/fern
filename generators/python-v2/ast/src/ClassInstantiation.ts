import { BaseInvocation } from "./BaseInvocation";
import { Reference } from "./Reference";

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
