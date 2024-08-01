import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, SwiftClass } from "..";

export declare namespace TypeAlias {
  interface Args {
    accessLevel?: AccessLevel
    name: string
    class: SwiftClass,
    comment?: string
  }
}

export class TypeAlias extends AstNode {

  public readonly accessLevel?: AccessLevel;
  public readonly name: string;
  public readonly class: SwiftClass;
  public readonly comment?: string;

  constructor(args: TypeAlias.Args) {
    super(Swift.indentSize);
    this.accessLevel = args.accessLevel;
    this.name = args.name;
    this.class = args.class;
    this.comment = args.comment;
  }

  public write(writer: Writer): void {

    if (this.comment) {
      writer.writeNode(Swift.makeComment({ comment: this.comment }));
    }

    // typealias OptionalCustomClass = CustomClass
    const title = [this.accessLevel, "typealias", this.name, "=", this.class.name].filter(value => value !== undefined).join(" ");
    writer.write(title);

  }

}