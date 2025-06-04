import { ts } from "@fern-api/typescript-ast";

export declare namespace FunctionParameterNode {
    interface Args {
        name: string;
        type?: ts.AstNode;
        docs?: string;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class FunctionParameterNode extends ts.AstNode {
    constructor(private readonly args: FunctionParameterNode.Args) {
        super();
    }

    public write(writer: ts.Writer): void {
        if (this.args.docs != null) {
            writer.writeNode(new ts.Comment({ docs: this.args.docs }));
        }
        writer.write(this.args.name);
        if (this.args.type) {
            writer.write(": ");
            this.args.type.write(writer);
        }
    }
}
