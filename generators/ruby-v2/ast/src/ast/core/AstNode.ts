import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { RubyFile } from "./RubyFile";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        customConfig,
        formatter
    }: {
        customConfig: BaseRubyCustomConfigSchema;
        formatter?: AbstractFormatter;
    }): Promise<string> {
        const file = new RubyFile({
            customConfig,
            formatter
        });
        this.write(file);
        return file.toStringAsync();
    }

    /**
     * Writes the node to a string.
     */
    public toString({
        customConfig,
        formatter
    }: {
        customConfig: BaseRubyCustomConfigSchema;
        formatter?: AbstractFormatter;
    }): string {
        const file = new RubyFile({
            customConfig,
            formatter
        });
        this.write(file);
        return file.toString();
    }
}
