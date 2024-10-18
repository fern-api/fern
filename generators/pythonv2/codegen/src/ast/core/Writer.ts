import { AbstractWriter } from "@fern-api/generator-commons";
import { Reference } from "../Reference";
import init, { format } from "@wasm-fmt/ruff_fmt";

/* A dot-separated string representing the module path */
type ModulePath = string;

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    public toString(): string {
        return this.buffer;
    }

    public async toStringFormatted(): Promise<string> {
        await init();
        return format(this.buffer);
    }
}
