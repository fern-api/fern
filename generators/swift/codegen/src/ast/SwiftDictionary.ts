import { Writer } from "@fern-api/generator-commons";
import Swift, { Enum, SwiftClass } from "..";

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
        /* Key Type */
        keyClass: SwiftClass | Enum;
        /* Value Type */
        valueClass: SwiftClass | Enum;
        // TODO: Handle default value
    }
}

export class SwiftDictionary extends SwiftClass {

    constructor(args: SwiftDictionary.Args) {
        const clazz = Swift.makeClass({ name: "Dictionary" });
        super({
          accessLevel: clazz.accessLevel,
          name: `[${args.keyClass.name}: ${args.valueClass.name}]`,
          subclasses: clazz.subclasses,
          fields: clazz.fields,
          functions: clazz.functions,
          inheritance: clazz.inheritance,
        });
      }
    
      public write(writer: Writer): void {
        writer.writeNode(this);
      }

}