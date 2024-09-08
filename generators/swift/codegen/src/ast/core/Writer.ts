import { AbstractWriter } from "@fern-api/generator-commons";

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }
}
