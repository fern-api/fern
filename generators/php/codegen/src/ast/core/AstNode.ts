import { AbstractAstNode } from "@fern-api/base-generator";

import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";
import { Writer } from "./Writer";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public toString({
        namespace,
        rootNamespace,
        customConfig
    }: {
        namespace: string;
        rootNamespace: string;
        customConfig: BasePhpCustomConfigSchema;
    }): string {
        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return writer.toString();
    }
}
