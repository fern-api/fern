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
        rootNamespace: string
    ): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            rootNamespace
        });
        this.write(writer);
        return writer.toString();
    }
}
