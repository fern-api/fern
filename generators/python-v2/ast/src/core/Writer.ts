import { Config } from "@wasm-fmt/ruff_fmt";

import { AbstractWriter } from "@fern-api/base-generator";

import { Reference } from "../Reference";
import { ImportedName } from "./types";

export declare namespace Writer {}

export class Writer extends AbstractWriter {
    private fullyQualifiedModulePathsToImportedNames: Record<string, ImportedName> = {};

    public setRefNameOverrides(completeRefPathsToNameOverrides: Record<string, ImportedName>): void {
        this.fullyQualifiedModulePathsToImportedNames = completeRefPathsToNameOverrides;
    }

    public unsetRefNameOverrides(): void {
        this.fullyQualifiedModulePathsToImportedNames = {};
    }

    public getRefNameOverride(reference: Reference): ImportedName {
        const explicitNameOverride =
            this.fullyQualifiedModulePathsToImportedNames[reference.getFullyQualifiedModulePath()];

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
