import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { Class } from "..";
import { AccessLevel } from "./AccessLevel";

export declare namespace TypeAlias {
  interface Args {
    accessLevel?: AccessLevel
    name: string
    class: Class
  }
}

export class TypeAlias extends AstNode {

  public readonly accessLevel?: AccessLevel;
  public readonly name: string;
  public readonly class: Class;

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