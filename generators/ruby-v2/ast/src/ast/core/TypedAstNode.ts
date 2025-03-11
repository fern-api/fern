import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";
import { AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";
import { AstNode } from "./AstNode";
import { RubyFile } from "./RubyFile";

export abstract class TypedAstNode extends AstNode {
    public abstract writeTypeDefinition(writer: AbstractWriter): void;

    /**
     * Writes the node's type definition to a string.
     */
    public typeDefinitionToString({
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
        this.writeTypeDefinition(file);
        return file.toString();
    }
}
