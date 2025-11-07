import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";

import { Writer } from "./Writer";

export abstract class AstNode extends AbstractAstNode {
    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }

    public toStringWithIndentation(indentation: number): string {
        const writer = new Writer();
        for (let i = 1; i < indentation; i++) {
            writer.indent();
        }
        this.write(writer);
        for (let i = 1; i < indentation; i++) {
            writer.dedent();
        }
        return writer.toString();
    }
}
