import { AbstractAstNode } from "@fern-api/generator-commons";
import { Writer } from "./Writer";
import init, { format } from "@wasm-fmt/ruff_fmt";

export abstract class AstNode extends AbstractAstNode {
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
