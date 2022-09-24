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
    public abstract getExportedName(name: Name): string;

    public getReferenceTo(
        name: Name,
        { importStrategy, addImport, referencedIn }: DeclarationReferencer.getReferenceTo.Options
    ): Reference {
        switch (importStrategy.type) {
            case "direct":
                return getDirectReferenceToExport({
                    exportedName: this.getExportedName(name),
                    exportedFromPath: this.getExportedFilepath(name),
                    importAlias: importStrategy.alias,
                    addImport,
                    referencedIn,
                });
            case "fromRoot":
                return getReferenceToExportFromRoot({
                    exportedName: this.getExportedName(name),
                    exportedFromPath: this.getExportedFilepath(name),
                    referencedIn,
                    addImport,
                });
            default:
                assertNever(importStrategy);
        }
    }
}
