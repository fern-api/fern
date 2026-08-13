import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { TypescriptCustomConfigSchema } from "../../custom-config/TypescriptCustomConfigSchema.js";
import { TypeScriptFile } from "./TypeScriptFile.js";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        customConfig,
        formatter
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined;
        formatter?: AbstractFormatter;
    }): Promise<string> {
        const file = new TypeScriptFile({ customConfig, formatter });
        this.write(file);
        return await file.toStringAsync();
    }

    public toString({
        customConfig,
        formatter
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined;
        formatter?: AbstractFormatter;
    }): string {
        const file = new TypeScriptFile({ customConfig, formatter });
        this.write(file);
        return file.toString();
    }

    /**
     * Writes the node without the import statements it references. `hasImports` reports
     * whether any were dropped, since the code is only valid on its own without them.
     */
    public toStringWithoutImports({
        customConfig,
        formatter
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined;
        formatter?: AbstractFormatter;
    }): { code: string; hasImports: boolean } {
        const file = new TypeScriptFile({ customConfig, formatter });
        this.write(file);
        return { code: file.toString({ omitImports: true }), hasImports: file.hasImports() };
    }
}
