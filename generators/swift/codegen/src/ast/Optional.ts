import { Writer } from "@fern-api/generator-commons";
import { Class_ } from "..";

/*

Builds Swift Optional
=====================

Example:

Person?

*/

export declare namespace Optional {
    interface Args {
        class: Class_
    }
}

export class Optional extends Class_ {

    constructor(args: Optional.Args) {
        super({
            accessLevel: args.class.accessLevel,
            name: `${args.class.name}?`,
            subclasses: args.class.subclasses,
            fields: args.class.fields,
            functions: args.class.functions,
            inheritance: args.class.inheritance,
        });
    }

    public write(writer: Writer): void {
        writer.writeNode(this);
    }

}
