import { AbstractWriter } from "@fern-api/base-generator";
import { Config } from "@wasm-fmt/ruff_fmt";
import { Reference } from "../Reference";

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    private completeRefPathsToNameOverrides: Record<string, { name: string; isAlias: boolean }> = {};

    public setRefNameOverrides(
        completeRefPathsToNameOverrides: Record<string, { name: string; isAlias: boolean }>
    ): void {
        this.completeRefPathsToNameOverrides = completeRefPathsToNameOverrides;
    }

    public unsetRefNameOverrides(): void {
        this.completeRefPathsToNameOverrides = {};
    }

    public getRefNameOverride(reference: Reference): { name: string; isAlias: boolean } {
        const explicitNameOverride = this.completeRefPathsToNameOverrides[reference.getCompletePath()];

        if (explicitNameOverride) {
            return explicitNameOverride;
        }

        return { name: reference.alias ?? reference.name, isAlias: !!reference.alias };
    }

    public toString(): string {
        return this.buffer;
    }

    public async toStringFormatted(config?: Config): Promise<string> {
        const { default: init, format } = await import("@wasm-fmt/ruff_fmt");
        await init();
        return format(this.buffer, undefined, config);
    }
}
