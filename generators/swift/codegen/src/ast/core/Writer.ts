import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }
}
