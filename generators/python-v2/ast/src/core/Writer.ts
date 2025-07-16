import { AbstractFormatter, AbstractWriter } from "@fern-api/browser-compatible-base-generator"

import { Reference } from "../Reference"
import { ImportedName } from "./types"

export class Writer extends AbstractWriter {
    private fullyQualifiedModulePathsToImportedNames: Record<string, ImportedName> = {}

    public setRefNameOverrides(completeRefPathsToNameOverrides: Record<string, ImportedName>): void {
        this.fullyQualifiedModulePathsToImportedNames = completeRefPathsToNameOverrides
    }

    public unsetRefNameOverrides(): void {
        this.fullyQualifiedModulePathsToImportedNames = {}
    }

    public getRefNameOverride(reference: Reference): ImportedName {
        const explicitNameOverride =
            this.fullyQualifiedModulePathsToImportedNames[reference.getFullyQualifiedModulePath()]

        if (explicitNameOverride) {
            return explicitNameOverride
        }

        return { name: reference.alias ?? reference.name, isAlias: !!reference.alias }
    }

    public toString(): string {
        return this.buffer
    }

    public async toStringFormatted(formatter: AbstractFormatter): Promise<string> {
        return formatter.format(this.buffer)
    }
}
