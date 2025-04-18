import { AbstractAstNode, AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { Reference } from "../Reference";
import { Writer } from "./Writer";

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
    public async toStringFormatted(formatter: AbstractFormatter): Promise<string> {
        const writer = new Writer();
        this.write(writer);
        return writer.toStringFormatted(formatter);
    }
}
