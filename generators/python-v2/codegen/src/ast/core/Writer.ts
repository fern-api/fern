import { AbstractWriter } from "@fern-api/generator-commons";
import init, { Config, format } from "@wasm-fmt/ruff_fmt";

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }

    public async toStringFormatted(config?: Config): Promise<string> {
        await init();
        return format(this.toString(), undefined, config);
    }
}
