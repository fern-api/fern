import { AbstractAstNode, AbstractFormatter, AbstractWriter } from "@fern-api/browser-compatible-base-generator";

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
        customConfig?: BaseRubyCustomConfigSchema;
        formatter?: AbstractFormatter;
    } = {}): Promise<string> {
        const file = new RubyFile({
            customConfig: customConfig ?? {},
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
        customConfig?: BaseRubyCustomConfigSchema;
        formatter?: AbstractFormatter;
    } = {}): string {
        const file = new RubyFile({
            customConfig: customConfig ?? {},
            formatter
        });
        this.write(file);
        return file.toString();
    }

    /**
     * Writes the node's type definition to a string.
     */
    public typeDefinitionToString({
        customConfig,
        formatter
    }: {
        customConfig?: BaseRubyCustomConfigSchema;
        formatter?: AbstractFormatter;
    } = {}): string {
        const file = new RubyFile({
            customConfig: customConfig ?? {},
            formatter
        });
        this.writeTypeDefinition(file);
        return file.toString();
    }

    /**
     * Writes the node to an RBI string for Sorbet type checking.
     */
    public toStringRbi({
        customConfig,
        formatter
    }: {
        customConfig?: BaseRubyCustomConfigSchema;
        formatter?: AbstractFormatter;
    } = {}): string {
        const file = new RubyFile({
            customConfig: customConfig ?? {},
            formatter
        });
        this.writeRbi(file);
        return file.toString();
    }

    /**
     * Writes type definition. No-op by default, but will be overridden by implementing classes.
     */
    public writeTypeDefinition(writer: AbstractWriter): void {
        return;
    }

    /**
     * Writes RBI content for Sorbet type checking. Delegates to write by default.
     */
    public writeRbi(writer: AbstractWriter): void {
        this.write(writer);
    }
}
