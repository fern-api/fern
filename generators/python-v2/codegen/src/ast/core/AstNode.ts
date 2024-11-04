import { AbstractAstNode } from "@fern-api/generator-commons";
import { Writer } from "./Writer";
import init, { Config, format } from "@wasm-fmt/ruff_fmt";
import type { Reference } from "../Reference";

export abstract class AstNode extends AbstractAstNode {
    protected references: Reference[] = [];

    public addReference(reference: Reference): void {
        this.references.push(reference);
    }

    public inheritReferences(astNode: AstNode | undefined): void {
        if (astNode === undefined) {
            return;
        }

        astNode.references.forEach((reference) => {
            if (!this.references.includes(reference)) {
                this.addReference(reference);
            }
        });
    }

    public getReferences(): Reference[] {
        return this.references;
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
    public async toStringFormatted(config?: Config): Promise<string> {
        await init();
        return format(this.toString(), undefined, config);
    }
}
