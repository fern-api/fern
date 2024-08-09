import { ClassReference } from "../ClassReference";
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
        allNamespaceSegmentsAndTypes: Set<string | ClassReference>,
        rootNamespace: string
    ): string {
        const writer = new Writer({
            namespace,
            allNamespaceSegmentsAndTypes,
            rootNamespace
        });
        this.write(writer);
        return writer.toString();
    }
}
