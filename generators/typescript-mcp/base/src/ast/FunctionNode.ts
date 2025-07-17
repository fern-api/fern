import { ts } from "@fern-api/typescript-ast";

import { FunctionParameterNode } from "./";

export declare namespace FunctionNode {
    interface Args {
        name?: string;
        parameters: FunctionParameterNode[];
        body: ts.CodeBlock;
        return_?: ts.Type;
        async?: boolean;
        docs?: string;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class FunctionNode extends ts.AstNode {
    readonly ["async"]: boolean;

    constructor(private readonly args: FunctionNode.Args) {
        super();
        this.async = args.async ?? false;
    }

    public write(writer: ts.Writer): void {
        writer.writeNode(new ts.Comment({ docs: this.args.docs }));
        if (this.async) {
            writer.write("async ");
        }
        writer.write("function ");
        if (this.args.name) {
            writer.write(`${this.args.name}`);
        }
        this.writeParameters(writer);
        if (this.args.return_ != null) {
            writer.write(": ");
            writer.writeNode(this.async ? ts.Type.promise(this.args.return_) : this.args.return_);
        }
        writer.writeLine(" {");
        writer.indent();
        this.args.body.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
    }

    private writeParameters(writer: ts.Writer): void {
        if (this.args.parameters.length === 0) {
            writer.write("()");
            return;
        }
        writer.indent();
        writer.writeLine("(");
        for (const parameter of this.args.parameters) {
            writer.writeNode(parameter);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write(")");
    }
}
