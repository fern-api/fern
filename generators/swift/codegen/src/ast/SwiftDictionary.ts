import { Writer } from "@fern-api/generator-commons";
import { Enum, SwiftClass } from "..";

/*

Builds Swift Types (Classes, Structs, etc)
==========================================

Example:

private class Mike: Person {

    class Snowboard {
        ...
    }
    
    func wave() {
        print("👋")
    }

}

Breakdown:

{accessLevel} {classLevel} {name}: {inheritance} {

    {subclasses}
    
    {functions}

}

*/

export declare namespace SwiftDictionary {
    interface Args {
        class: SwiftClass;
        /* Key Type */
        keyClass: SwiftClass | Enum;
        /* Value Type */
        valueClass: SwiftClass | Enum;
        // TODO: Handle default value
    }
}

export class SwiftDictionary extends SwiftClass {

    constructor(args: SwiftDictionary.Args) {
        super({
          accessLevel: args.class.accessLevel,
          name: `[${args.keyClass.name}: ${args.valueClass.name}]`,
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