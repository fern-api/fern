import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator"

import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema"
import { GoFile } from "./GoFile"

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        packageName,
        rootImportPath,
        importPath,
        customConfig,
        formatter
    }: {
        packageName: string
        rootImportPath: string
        importPath: string
        customConfig: BaseGoCustomConfigSchema
        formatter?: AbstractFormatter
    }): Promise<string> {
        const file = new GoFile({
            packageName,
            rootImportPath,
            importPath,
            customConfig,
            formatter
        })
        this.write(file)
        return file.toStringAsync()
    }

    /**
     * Writes the node to a string.
     */
    public toString({
        packageName,
        rootImportPath,
        importPath,
        customConfig,
        formatter
    }: {
        packageName: string
        rootImportPath: string
        importPath: string
        customConfig: BaseGoCustomConfigSchema
        formatter?: AbstractFormatter
    }): string {
        const file = new GoFile({
            packageName,
            rootImportPath,
            importPath,
            customConfig,
            formatter
        })
        this.write(file)
        return file.toString()
    }
}
