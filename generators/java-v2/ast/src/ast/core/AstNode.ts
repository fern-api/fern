import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { BaseJavaCustomConfigSchema } from "../../custom-config/BaseJavaCustomConfigSchema.js";
import { JavaFile } from "./JavaFile.js";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        packageName,
        customConfig,
        formatter
    }: {
        packageName: string;
        customConfig: BaseJavaCustomConfigSchema;
        formatter?: AbstractFormatter;
    }): Promise<string> {
        const file = new JavaFile({
            packageName,
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
        packageName,
        customConfig,
        formatter
    }: {
        packageName: string;
        customConfig: BaseJavaCustomConfigSchema;
        formatter?: AbstractFormatter;
    }): string {
        const file = new JavaFile({
            packageName,
            customConfig,
            formatter
        });
        this.write(file);
        return file.toString();
    }
}
