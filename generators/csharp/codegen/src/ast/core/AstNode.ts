import { BaseCsharpCustomConfigSchema } from "../../custom-config";
import { Writer } from "./Writer";

type Namespace = string;

export abstract class AstNode {
    /**
     * Every AST node knows how to write itself to a string.
     */
    public abstract write(writer: Writer): void;

    /**
     * Writes the node to a string.
     */
    public toString(
        namespace: string,
        allNamespaceSegments: Set<string>,
        allTypeClassReferences: Map<string, Set<Namespace>>,
        rootNamespace: string,
        customConfig: BaseCsharpCustomConfigSchema
    ): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return writer.toString();
    }
}
