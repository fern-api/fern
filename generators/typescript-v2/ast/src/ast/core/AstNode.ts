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
     * Writes the node without the import statements it references. `imports` is the rendered
     * import block the code would otherwise need (empty string when none), and `hasImports`
     * reports whether any were separated out.
     */
    public toStringWithoutImports({
        customConfig,
        formatter
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined;
        formatter?: AbstractFormatter;
    }): { code: string; imports: string; hasImports: boolean } {
        const file = new TypeScriptFile({ customConfig, formatter });
        this.write(file);
        return {
            code: file.toString({ omitImports: true }),
            imports: file.getImports(),
            hasImports: file.hasImports()
        };
    }
}
