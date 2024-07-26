import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift from "..";

export declare namespace Comment {
  interface Args {
    comment: string;
  }
}

export class Comment extends AstNode {

  public readonly comment: string;

  constructor(args: Comment.Args) {
    super(Swift.indentSize);
    this.comment = args.comment;
  }

  private buildComment(comment: string): string {
    const lines = comment.split("\n");
    const formattedLines = lines.map(line => `/// ${line}`).join("\n");
    return formattedLines;
  }

  public write(writer: Writer): void {
    writer.write(this.buildComment(this.comment));
  }

}
