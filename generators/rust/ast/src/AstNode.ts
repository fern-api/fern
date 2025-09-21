import { Writer } from "./Writer";

export abstract class AstNode {
    public abstract write(writer: Writer): void;

    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }
}
