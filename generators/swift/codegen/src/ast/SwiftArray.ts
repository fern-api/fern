import { Writer } from "@fern-api/generator-commons";
import { Class_ } from "..";

/*

Builds Swift Optional
=====================

Example:

Person?

*/

export declare namespace SwiftArray {
  interface Args {
    class: Class_
  }
}

export class SwiftArray extends Class_ {

  constructor(args: SwiftArray.Args) {
    super({
      accessLevel: args.class.accessLevel,
      name: `[${args.class.name}]`,
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