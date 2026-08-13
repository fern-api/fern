import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { TypescriptCustomConfigSchema } from "../../custom-config/TypescriptCustomConfigSchema.js";
import { TypeScriptFile } from "./TypeScriptFile.js";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        customConfig,
        formatter,
        omitImports
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined;
        formatter?: AbstractFormatter;
        omitImports?: boolean;
    }): Promise<string> {
        const file = new TypeScriptFile({ customConfig, formatter });
        this.write(file);
        return await file.toStringAsync({ omitImports });
    }

    public toString({
        customConfig,
        formatter,
        omitImports
    }: {
        customConfig: TypescriptCustomConfigSchema | undefined;
        formatter?: AbstractFormatter;
        omitImports?: boolean;
    }): string {
        const file = new TypeScriptFile({ customConfig, formatter });
        this.write(file);
        return file.toString({ omitImports });
    }
}
