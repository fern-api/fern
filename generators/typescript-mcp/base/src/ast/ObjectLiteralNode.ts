import { ts } from "@fern-api/typescript-ast";

export interface ObjectLiteralField {
    name: string;
    value: ts.AstNode;
}

export declare namespace ObjectLiteralNode {
    interface Args {
        fields: ObjectLiteralField[];
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ObjectLiteralNode extends ts.AstNode {
    public constructor(private readonly args: ObjectLiteralNode.Args) {
        super();
    }

    public write(writer: ts.Writer): void {
        writer.write("{");
        writer.newLine();
        writer.indent();
        for (const field of this.args.fields) {
            writer.write(`${field.name}: `);
            writer.writeNode(field.value);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}
