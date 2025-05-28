import { ts } from "@fern-api/typescript-ast";

export declare namespace MethodInvocationNode {
    interface Args {
        on: ts.AstNode;
        method: string;
        arguments_: ts.AstNode[];
        async?: boolean;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class MethodInvocationNode extends ts.AstNode {
    constructor(private readonly args: MethodInvocationNode.Args) {
        super();
    }

    public write(writer: ts.Writer): void {
        if (this.args.async) {
            writer.write("await ");
        }
        this.args.on.write(writer);
        writer.write(".");
        writer.write(this.args.method);
        writer.write("(");
        writer.delimit({
            nodes: this.args.arguments_,
            delimiter: ", ",
            writeFunction: (argument) => argument.write(writer)
        });
        writer.write(")");
    }
}
