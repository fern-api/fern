import { assertNever } from "@fern-api/core-utils";
import {
    ExportedDirectory,
    ExportedFilePath,
    getDirectReferenceToExport,
    getReferenceToExportFromRoot,
    Reference,
} from "@fern-typescript/commons";
import { DeclarationReferencer } from "./DeclarationReferencer";

export declare namespace AbstractDeclarationReferencer {
    export interface Init {
        apiName: string;
        aliasOfRoot: string | undefined;
        containingDirectory: ExportedDirectory[];
    }
}

export abstract class AbstractDeclarationReferencer<Name = never> implements DeclarationReferencer<Name> {
    protected apiName: string;
    protected aliasOfRoot: string | undefined;
    protected containingDirectory: ExportedDirectory[];

    constructor({ apiName, containingDirectory, aliasOfRoot }: AbstractDeclarationReferencer.Init) {
        this.apiName = apiName;
        this.aliasOfRoot = aliasOfRoot;
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
            importStrategy,
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
                    subImport,
                    aliasOfRoot: this.aliasOfRoot,
                });
            case "fromRoot":
                return getReferenceToExportFromRoot({
                    exportedName,
                    exportedFromPath: this.getExportedFilepathForReference(name),
                    referencedIn,
                    importsManager,
                    namespaceImport: importStrategy.namespaceImport,
                    useDynamicImport: importStrategy.useDynamicImport,
                    subImport,
                    aliasOfRoot: this.aliasOfRoot,
                });
            default:
                assertNever(importStrategy);
        }
    }
}
