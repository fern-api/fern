import { ts } from "@fern-api/typescript-ast"

export declare namespace ExportNode {
    interface Args {
        initializer: ts.AstNode
        default?: boolean
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ExportNode extends ts.AstNode {
    public constructor(private readonly args: ExportNode.Args) {
        super()
    }

    public write(writer: ts.Writer): void {
        if (this.args.default) {
            writer.write("export default ")
        } else {
            writer.write("export ")
        }
        writer.writeNode(this.args.initializer)
    }
}
