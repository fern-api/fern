import { AbstractAstNode } from "@fern-api/generator-commons";
import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";
import { Writer } from "./Writer";
import { ReferenceCollector } from "./ReferenceCollector";

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
        const referenceCollector = new ReferenceCollector({
            namespace,
            rootNamespace,
            customConfig
        });
        const references = referenceCollector.collectAllReferences(this);
        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig,
            references
        });
        this.write(writer);
        return writer.toString();
    }

    public addReferences({ writer }: { writer: Writer }): void {}
}
