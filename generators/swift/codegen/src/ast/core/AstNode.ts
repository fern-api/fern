import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";

import { Writer } from "./Writer";

export abstract class AstNode extends AbstractAstNode {
    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }
}
