import { AbstractWriter } from "@fern-api/generator-commons";

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }
}
