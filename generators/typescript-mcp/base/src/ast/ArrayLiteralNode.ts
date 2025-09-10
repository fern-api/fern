import { ts } from "@fern-api/typescript-ast";

export declare namespace ArrayLiteralNode {
    interface Args {
        values: ts.AstNode[];
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ArrayLiteralNode extends ts.AstNode {
    public constructor(private readonly args: ArrayLiteralNode.Args) {
        super();
    }

    public write(writer: ts.Writer): void {
        writer.write("[");
        writer.newLine();
        writer.indent();
        for (const value of this.args.values) {
            writer.writeNode(value);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("]");
    }
}
