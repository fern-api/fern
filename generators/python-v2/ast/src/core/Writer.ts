import { AbstractWriter } from "@fern-api/generator-commons";

export declare namespace Writer {}

/* Dot delimited string where */
type Module = string;

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }

    public async toStringFormatted(): Promise<string> {
        const { default: init, format } = await import("@wasm-fmt/ruff_fmt");
        await init();
        return format(this.buffer);
    }
}
