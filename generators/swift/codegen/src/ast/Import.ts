import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift from "..";

export declare namespace Import {
  interface Args {
    packageName: string;
  }
}

export class Import extends AstNode {

  public readonly packageName: string;

  constructor(args: Import.Args) {
    super(Swift.indentSize);
    this.packageName = args.packageName;
  }

  public write(writer: Writer): void {
    writer.write(`import ${this.packageName}`);
  }

}
