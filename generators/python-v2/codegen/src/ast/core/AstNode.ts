import { AbstractAstNode } from "@fern-api/generator-commons";
import { Writer } from "./Writer";
import init, { format } from "@wasm-fmt/ruff_fmt";
import { Reference } from "../Reference";

export abstract class AstNode extends AbstractAstNode {
    protected references: Reference[] = [];

    public addReference(reference: Reference): void {
        this.references.push(reference);
        this.inheritReferences(reference);
    }

    public inheritReferences(astNode: AstNode | undefined): void {
        if (astNode === undefined) {
            return;
        }

        astNode.references.forEach((reference) => {
            this.addReference(reference);
        });
    }

    /**
     * Writes the node to a string.
     */
    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }

    /**
     * Writes the node to a string and formats it.
     */
    public async toStringFormatted(): Promise<string> {
        await init();
        return format(this.toString());
    }
}
