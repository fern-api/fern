import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export class Expression implements AstNode {
    private constructor(private readonly content: string) {}

    public write(writer: Writer): void {
        writer.write(this.content);
    }

    public static of(content: string): Expression {
        return new Expression(content);
    }

    public static string(value: string): Expression {
        return new Expression(`"${value.replace(/"/g, '\\"')}"`);
    }

    public static number(value: number): Expression {
        return new Expression(value.toString());
    }

    public static boolean(value: boolean): Expression {
        return new Expression(value.toString());
    }

    public static null(): Expression {
        return new Expression("null");
    }

    public static listOf(...elements: Expression[]): Expression {
        const content = `listOf(${elements.map((e) => {
            const writer = new Writer();
            e.write(writer);
            return writer.toString();
        }).join(", ")})`;
        return new Expression(content);
    }

    public static mapOf(...entries: [Expression, Expression][]): Expression {
        const content = `mapOf(${entries.map(([k, v]) => {
            const keyWriter = new Writer();
            const valueWriter = new Writer();
            k.write(keyWriter);
            v.write(valueWriter);
            return `${keyWriter.toString()} to ${valueWriter.toString()}`;
        }).join(", ")})`;
        return new Expression(content);
    }
}
