import { AbstractWriter } from '@fern-api/base-generator'

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer
    }
}
