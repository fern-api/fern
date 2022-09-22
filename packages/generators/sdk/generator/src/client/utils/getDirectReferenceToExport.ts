import { Reference } from "@fern-typescript/declaration-handler";
import { SourceFile, ts } from "ts-morph";
import { convertExportedFilePathToFilePath, ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";

export declare namespace getDirectReferenceToExport {
    export interface Args {
        referencedIn: SourceFile;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        filepath: ExportedFilePath;
        exportedName: string;
        importAlias?: string;
    }
}

export function getDirectReferenceToExport({
    referencedIn,
    addImport,
    filepath,
    exportedName,
    importAlias,
}: getDirectReferenceToExport.Args): Reference {
    const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
        referencedIn,
        convertExportedFilePathToFilePath(filepath)
    );

    addImport(moduleSpecifier, {
        namedImports: [
            {
                name: exportedName,
                alias: importAlias,
            },
        ],
    });

    const importedName = importAlias ?? exportedName;

    return {
        entityName: ts.factory.createIdentifier(importedName),
        expression: ts.factory.createIdentifier(importedName),
    };
}
