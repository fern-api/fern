import { ts } from '@fern-api/typescript-ast'

import { ExportNode } from './'

export declare namespace ReExportAsNamedNode {
    interface Args {
        name: string
        importFrom: ts.Reference.ModuleImport
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ReExportAsNamedNode extends ts.AstNode {
    public constructor(private readonly args: ReExportAsNamedNode.Args) {
        super()
    }

    public write(writer: ts.Writer): void {
        writer.writeNode(
            new ExportNode({
                initializer: ts.codeblock((writer) => {
                    switch (this.args.importFrom.type) {
                        case 'default':
                            writer.write(`{ default as ${this.args.name} }`)
                            break
                        case 'star':
                            writer.write(`{ * as ${this.args.name} }`)
                            break
                        case 'named':
                            writer.write(this.args.name)
                            break
                    }
                    // TODO: re-write to support non-relative imports
                    // SEE: https://github.com/fern-api/fern/pull/7121#discussion_r2095771293
                    writer.write(` from "./${this.args.importFrom.moduleName}"`)
                })
            })
        )
    }
}
