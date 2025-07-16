import { AbstractFormatter, File } from "@fern-api/base-generator"
import { RelativeFilePath } from "@fern-api/fs-utils"
import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast"

export declare namespace GoFile {
    interface Args {
        /* The node to be written to the Go source file */
        node: go.AstNode
        /* Directory of the file */
        directory: RelativeFilePath
        /* Filename of the file */
        filename: string
        /* The package name of the file */
        packageName: string
        /* The root import path of the module */
        rootImportPath: string
        /* The import path of the file */
        importPath: string
        /* Custom generator config */
        customConfig: BaseGoCustomConfigSchema
        /* Optional formatter */
        formatter?: AbstractFormatter
    }
}

export class GoFile extends File {
    constructor({
        node,
        directory,
        filename,
        packageName,
        rootImportPath,
        importPath,
        customConfig,
        formatter
    }: GoFile.Args) {
        super(
            filename,
            directory,
            node.toString({
                packageName,
                rootImportPath,
                importPath,
                customConfig,
                formatter
            })
        )
    }
}
