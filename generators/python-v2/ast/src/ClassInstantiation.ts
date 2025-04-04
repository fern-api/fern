import { BaseInvocation } from "./BaseInvocation";
import { Reference } from "./Reference";
import { Writer } from "./core/Writer";

export declare namespace ClassInstantiation {
    interface Args extends Omit<BaseInvocation.Args, "reference"> {
        /* A reference to the class that you'd like to instantiate */
        classReference: Reference;
        /* The name of the variable to assign the instantiated class to */
        assignTo?: string;
    }
}

export class ClassInstantiation extends BaseInvocation {
    private assignTo: string | undefined;

    constructor({ classReference, assignTo, ...args }: ClassInstantiation.Args) {
        super({ reference: classReference, ...args });
        this.assignTo = assignTo;
    }

    public write(writer: Writer): void {
        if (this.assignTo) {
            writer.write(this.assignTo);
            writer.write(" = ");
        }
        super.write(writer);
    }
}
