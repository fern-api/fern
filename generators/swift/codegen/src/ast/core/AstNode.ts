import { AbstractAstNode } from "@fern-api/base-generator"

import { Writer } from "./Writer"

export abstract class AstNode extends AbstractAstNode {
    public toString(): string {
        const writer = new Writer()
        this.write(writer)
        return writer.toString()
    }
}
