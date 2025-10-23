import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export class Statement implements AstNode {
    private constructor(private readonly content: string) {}

    public write(writer: Writer): void {
        writer.writeLine(this.content);
    }

    public static of(content: string): Statement {
        return new Statement(content);
    }

    public static return(expression?: string): Statement {
        return new Statement(expression != null ? `return ${expression}` : "return");
    }

    public static throw(expression: string): Statement {
        return new Statement(`throw ${expression}`);
    }
}
