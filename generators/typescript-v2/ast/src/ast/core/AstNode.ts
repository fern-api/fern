import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator"

import { TypescriptCustomConfigSchema } from "../../custom-config/TypescriptCustomConfigSchema"
import { TypeScriptFile } from "./TypeScriptFile"

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        customConfig,
        formatter
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined
        formatter?: AbstractFormatter
    }): Promise<string> {
        const file = new TypeScriptFile({ customConfig, formatter })
        this.write(file)
        return await file.toStringAsync()
    }

    public toString({
        customConfig,
        formatter
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined
        formatter?: AbstractFormatter
    }): string {
        const file = new TypeScriptFile({ customConfig, formatter })
        this.write(file)
        return file.toString()
    }
}
