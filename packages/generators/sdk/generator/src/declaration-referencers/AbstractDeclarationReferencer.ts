import { assertNever } from "@fern-api/core-utils";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedDirectory, ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { getDirectReferenceToExport } from "./utils/getDirectReferenceToExport";
import { getReferenceToExportFromRoot } from "./utils/getReferenceToExportFromRoot";

export declare namespace AbstractDeclarationReferencer {
    export interface Init {
        packageName: string;
        containingDirectory: ExportedDirectory[];
    }
}

export abstract class AbstractDeclarationReferencer<Name> implements DeclarationReferencer<Name> {
    private packageName: string;
    protected containingDirectory: ExportedDirectory[];

    constructor({ containingDirectory, packageName }: AbstractDeclarationReferencer.Init) {
        this.packageName = packageName;
        this.containingDirectory = containingDirectory;
    }

    public abstract getExportedFilepath(name: Name): ExportedFilePath;
    public abstract getFilename(name: Name): string;

    protected getExportedFilepathForReferences(name: Name): ExportedFilePath {
        return this.getExportedFilepath(name);
    }

    protected getReferenceTo(
        exportedName: string,
        {
            name,
            importsManager,
            referencedIn,
            subImport,
            importStrategy,
        }: DeclarationReferencer.getReferenceTo.Options<Name>
    ): Reference {
        switch (importStrategy.type) {
            case "direct":
                return getDirectReferenceToExport({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReferences(name),
                    importAlias: importStrategy.alias,
                    importsManager,
                    referencedIn,
                    subImport,
                    packageName: this.packageName,
                });
            case "fromRoot":
                return getReferenceToExportFromRoot({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReferences(name),
                    referencedIn,
                    importsManager,
                    namespaceImport: importStrategy.namespaceImport,
                    useDynamicImport: importStrategy.useDynamicImport,
                    subImport,
                    packageName: this.packageName,
                });
            default:
                assertNever(importStrategy);
        }
    }
}
