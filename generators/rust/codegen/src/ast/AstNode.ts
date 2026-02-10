import { Writer } from "./Writer.js";

export abstract class AstNode {
    public abstract write(writer: Writer): void;

    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }
}
