import { ClassReference } from "../ast/ClassReference";
import { Writer } from "./Writer";

type Namespace = string;

export abstract class AstNode {
    private references: Record<Namespace, ClassReference[]> = {};

    /**
     * Every AST node knows how to write itself to a string.
     */
    public abstract write(writer: Writer): void;

    /**
     * Adds a reference to the node.
     */
    protected addReference(reference: ClassReference): void {
        const namespace = this.references[reference.namespace];
        if (namespace != null) {
            namespace.push(reference);
        } else {
            this.references[reference.namespace] = [reference];
        }
    }

    /**
     * Writes the node to a string.
     */
    public toString(): string {
        const writer = new Writer();
        this.write(writer);

        // Call toString before writing imports
        // so that we can collect all the references
        const contents = writer.toString();

        return `
        ${this.writeImports()}

        ${contents}
        `;
    }

    public writeImports(): string {
        const writer = new Writer();

        for (const namespace in this.references) {
            writer.writeLine(`using ${namespace};`);
        }

        return writer.toString();
    }
}
