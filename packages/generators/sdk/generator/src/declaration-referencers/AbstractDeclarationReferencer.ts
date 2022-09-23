import { assertNever } from "@fern-api/core-utils";
import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import {
    convertExportedFilePathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { DeclarationReferencer } from "./DeclarationReferencer";
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
                return this.getDirectReferenceToExport({
                    name,
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

    private getDirectReferenceToExport({
        name,
        addImport,
        referencedIn,
        importAlias,
    }: {
        name: Name;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        referencedIn: SourceFile;
        importAlias: string | undefined;
    }): Reference {
        const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedFilePathToFilePath(this.getExportedFilepath(name))
        );

        const exportedName = this.getExportedName(name);

        addImport(moduleSpecifier, {
            namedImports: [
                {
                    name: exportedName,
                    alias: importAlias,
                },
            ],
        });

        const importedName = importAlias ?? exportedName;

        const entityName = ts.factory.createIdentifier(importedName);
        return {
            typeNode: ts.factory.createTypeReferenceNode(entityName),
            entityName,
            expression: ts.factory.createIdentifier(importedName),
        };
    }
}
