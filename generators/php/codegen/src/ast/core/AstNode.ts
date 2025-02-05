import { AbstractAstNode } from "@fern-api/base-generator";

import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";
import { Writer } from "./Writer";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public toString(param: {
        namespace: string;
        rootNamespace: string;
        customConfig: BasePhpCustomConfigSchema;
    }): string {
        if (param == null) {
            throw new Error(
                "param is required. You are likely implicitly calling toString() inside a string interpolation or concatenation."
            );
        }
        const { namespace, rootNamespace, customConfig } = param;

        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return writer.toString();
    }
}
