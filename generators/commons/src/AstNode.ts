import { Writer } from "./Writer";

export abstract class AstNode {
    private indentSize: number;

    constructor(indentSize: number) {
        this.indentSize = indentSize;
    }

    /**
     * Every AST node knows how to write itself to a string.
     */
    public abstract write(writer: Writer): void;

    /**
     * Writes the node to a string.
     */
    public toString(): string {
        const writer = new Writer(this.indentSize);
        this.write(writer);
        return writer.toString();
    }
}
