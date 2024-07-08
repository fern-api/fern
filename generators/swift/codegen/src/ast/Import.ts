import { AstNode, Writer } from "@fern-api/generator-commons";
import { INDENT_SIZE } from "../lang";

export declare namespace Import {
  interface Args {
    packageName: string;
  }
}

export class Import extends AstNode {

  public readonly packageName: string;

  constructor({
    packageName 
  }: Import.Args) {
    super(INDENT_SIZE);
    this.packageName = packageName;
  }

  public write(writer: Writer): void {
    writer.write(`import ${this.packageName}`);
  }

}