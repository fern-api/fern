import {
    ExportedDirectory,
    ExportedFilePath,
    Reference,
    getDirectReferenceToExport,
    getReferenceToExportFromRoot
} from "@fern-typescript/commons";

import { assertNever } from "@fern-api/core-utils";

import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace AbstractDeclarationReferencer {
    export interface Init {
        namespaceExport: string;
        containingDirectory: ExportedDirectory[];
    }
}

export abstract class AbstractDeclarationReferencer<Name = never> implements DeclarationReferencer<Name> {
    public readonly namespaceExport: string;
    protected containingDirectory: ExportedDirectory[];

    constructor({ namespaceExport, containingDirectory }: AbstractDeclarationReferencer.Init) {
        this.namespaceExport = namespaceExport;
        this.containingDirectory = containingDirectory;
    }

    public abstract getExportedFilepath(name: Name): ExportedFilePath;
    public abstract getFilename(name: Name): string;

    protected getExportedFilepathForReference(name: Name): ExportedFilePath {
        return this.getExportedFilepath(name);
    }

    protected getReferenceTo(
        exportedName: string,
        {
            name,
            importsManager,
            referencedIn,
            subImport,
            importStrategy
        }: DeclarationReferencer.getReferenceTo.Options<Name>
    ): Reference {
        switch (importStrategy.type) {
            case "direct":
                return getDirectReferenceToExport({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReference(name),
                    importAlias: importStrategy.alias,
                    importsManager,
                    referencedIn,
                    subImport
                });
            case "fromRoot":
                return getReferenceToExportFromRoot({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReference(name),
                    referencedIn,
                    importsManager,
                    namespaceImport: importStrategy.namespaceImport,
                    useDynamicImport: importStrategy.useDynamicImport,
                    subImport
                });
            default:
                assertNever(importStrategy);
        }
    }
}
