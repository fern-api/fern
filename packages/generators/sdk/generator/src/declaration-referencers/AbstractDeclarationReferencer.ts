import { assertNever } from "@fern-api/core-utils";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { ExportedDirectory, ExportedFilePath } from "../exports-manager/ExportedFilePath";
import { DeclarationReferencer } from "./DeclarationReferencer";
import { getDirectReferenceToExport } from "./utils/getDirectReferenceToExport";
import { getReferenceToExportFromRoot } from "./utils/getReferenceToExportFromRoot";

export declare namespace AbstractDeclarationReferencer {
    export interface Init {
        containingDirectory: ExportedDirectory[];
    }
}

export abstract class AbstractDeclarationReferencer<Name> implements DeclarationReferencer<Name> {
    protected containingDirectory: ExportedDirectory[];

    constructor({ containingDirectory }: AbstractDeclarationReferencer.Init) {
        this.containingDirectory = containingDirectory;
    }

    public abstract getExportedFilepath(name: Name): ExportedFilePath;
    public abstract getFilename(name: Name): string;

    protected getExportedFilepathForReferences(name: Name): ExportedFilePath {
        return this.getExportedFilepath(name);
    }

    protected getReferenceTo(
        exportedName: string,
        { name, addImport, referencedIn, subImport, importStrategy }: DeclarationReferencer.getReferenceTo.Options<Name>
    ): Reference {
        switch (importStrategy.type) {
            case "direct":
                return getDirectReferenceToExport({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReferences(name),
                    importAlias: importStrategy.alias,
                    addImport,
                    referencedIn,
                    subImport,
                });
            case "fromRoot":
                return getReferenceToExportFromRoot({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReferences(name),
                    referencedIn,
                    addImport,
                    namespaceImport: importStrategy.namespaceImport,
                    useDynamicImport: importStrategy.useDynamicImport,
                    subImport,
                });
            default:
                assertNever(importStrategy);
        }
    }
}
