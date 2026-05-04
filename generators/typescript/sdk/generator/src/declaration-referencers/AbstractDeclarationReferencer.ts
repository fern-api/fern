import { CaseConverter } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import {
    ExportedDirectory,
    ExportedFilePath,
    getDirectReferenceToExport,
    getReferenceToExportFromPackage,
    getReferenceToExportFromRoot,
    Reference
} from "@fern-typescript/commons";

import { DeclarationReferencer } from "./DeclarationReferencer.js";

export declare namespace AbstractDeclarationReferencer {
    export interface Init {
        namespaceExport: string;
        containingDirectory: ExportedDirectory[];
        consolidateTypeFiles?: boolean;
        namingOverride?: string;
        caseConverter: CaseConverter;
    }
}

export abstract class AbstractDeclarationReferencer<Name = never> implements DeclarationReferencer<Name> {
    public readonly namespaceExport: string;
    protected containingDirectory: ExportedDirectory[];
    protected consolidateTypeFiles: boolean;
    protected readonly case: CaseConverter;

    protected namingOverride: string | undefined;

    constructor({
        namespaceExport,
        containingDirectory,
        consolidateTypeFiles = false,
        namingOverride,
        caseConverter
    }: AbstractDeclarationReferencer.Init) {
        this.namespaceExport = namespaceExport;
        this.containingDirectory = containingDirectory;
        this.consolidateTypeFiles = consolidateTypeFiles;
        this.namingOverride = namingOverride;
        this.case = caseConverter;
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
            exportsManager,
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
                    exportsManager,
                    referencedIn,
                    subImport
                });
            case "fromRoot":
                return getReferenceToExportFromRoot({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReference(name),
                    referencedIn,
                    importsManager,
                    exportsManager,
                    namespaceImport: importStrategy.namespaceImport,
                    useDynamicImport: importStrategy.useDynamicImport,
                    subImport
                });
            case "fromPackage":
                return getReferenceToExportFromPackage({
                    importsManager,
                    namespaceImport: importStrategy.namespaceImport,
                    packageName: importStrategy.packageName,
                    exportedName,
                    subImport
                });
            default:
                assertNever(importStrategy);
        }
    }
}
