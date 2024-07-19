import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Class_ } from "..";

export declare namespace TypeAlias {
  interface Args {
    accessLevel?: AccessLevel
    name: string
    class: Class_
  }
}

export class TypeAlias extends AstNode {

  public readonly accessLevel?: AccessLevel;
  public readonly name: string;
  public readonly class: Class_;

  constructor(args: TypeAlias.Args) {
    super(Swift.indentSize);
    this.accessLevel = args.accessLevel;
    this.name = args.name;
    this.class = args.class;
  }

  public write(writer: Writer): void {
    const title = [this.accessLevel, "typealias", this.name, "=", this.class.name].filter(value => value !== undefined).join(" ");
    writer.write(title);
  }

}