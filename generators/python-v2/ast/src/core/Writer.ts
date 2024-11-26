import { AbstractWriter } from "@fern-api/base-generator";
import { Config } from "@wasm-fmt/ruff_fmt";

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }

    public async toStringFormatted(config?: Config): Promise<string> {
        const { default: init, format } = await import("@wasm-fmt/ruff_fmt");
        await init();
        return format(this.buffer, undefined, config);
    }
}
