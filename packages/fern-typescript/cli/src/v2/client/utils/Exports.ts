import path from "path";
import { Directory, SourceFile } from "ts-morph";
import { ModuleSpecifier } from "../types";
import { getRelativeModuleSpecifierTo } from "./getRelativeModuleSpecifierTo";

export interface ExportDeclaration {
    exportAll?: boolean;
    namespaceExport?: string;
    namedExports?: string[];
}

interface CombinedExportDeclarations {
    exportAll: boolean;
    namespaceExports: Set<string>;
    namedExports: Set<string>;
}

type PathToDirectory = string;

export class Exports {
    private exports: Record<PathToDirectory, Record<ModuleSpecifier, CombinedExportDeclarations>> = {};

    public addExport(from: SourceFile, exportDeclaration: ExportDeclaration): void {
        const fromPath = from.getFilePath();
        if (path.extname(fromPath).length === 0) {
            throw new Error("Cannot export from directory: " + fromPath);
        }

        const pathToDirectory = path.dirname(fromPath);
        const moduleSpecifierToExport = getRelativeModuleSpecifierTo(pathToDirectory, fromPath);

        this._addExportDeclaration({ pathToDirectory, moduleSpecifierToExport, exportDeclaration });
    }

    private _addExportDeclaration({
        pathToDirectory,
        moduleSpecifierToExport,
        exportDeclaration,
    }: {
        pathToDirectory: PathToDirectory;
        moduleSpecifierToExport: ModuleSpecifier;
        exportDeclaration: ExportDeclaration;
    }) {
        const exportsForDirectory = (this.exports[pathToDirectory] ??= {});

        const exportsForModuleSpecifier = (exportsForDirectory[moduleSpecifierToExport] ??= {
            exportAll: false,
            namespaceExports: new Set(),
            namedExports: new Set(),
        });

        if (exportDeclaration.exportAll != null) {
            exportsForModuleSpecifier.exportAll ||= exportDeclaration.exportAll;
        }

        if (exportDeclaration.namespaceExport != null) {
            exportsForModuleSpecifier.namespaceExports.add(exportDeclaration.namespaceExport);
        }

        if (exportDeclaration.namedExports != null) {
            for (const namedExport of exportDeclaration.namedExports) {
                exportsForModuleSpecifier.namedExports.add(namedExport);
            }
        }
    }

    public writeExportsToProject(rootDirectory: Directory): void {
        // first, make sure every directory is exported up to the root
        for (let pathToExport of Object.keys(this.exports)) {
            while (pathToExport !== "/") {
                const pathToParent = path.dirname(pathToExport);
                this._addExportDeclaration({
                    pathToDirectory: pathToParent,
                    moduleSpecifierToExport: getRelativeModuleSpecifierTo(pathToParent, pathToExport),
                    exportDeclaration: {
                        namespaceExport: path.basename(pathToExport),
                    },
                });
                pathToExport = pathToParent;
            }
        }

        for (const [pathToDirectory, moduleSpecifierToExports] of Object.entries(this.exports)) {
            for (const [moduleSpecifier, combinedExportDeclarations] of Object.entries(moduleSpecifierToExports)) {
                const namespaceExports = [...combinedExportDeclarations.namespaceExports];
                if (namespaceExports.length > 1) {
                    throw new Error(
                        `Multiple namespace exports from ${moduleSpecifier}: ${namespaceExports.join(", ")}`
                    );
                }

                const exportsFile = getExportsFileForDirectory({ pathToDirectory, rootDirectory });

                const namespaceExport = namespaceExports[0];
                if (namespaceExport != null) {
                    exportsFile.addExportDeclaration({
                        moduleSpecifier,
                        namespaceExport,
                    });
                }

                if (combinedExportDeclarations.exportAll) {
                    exportsFile.addExportDeclaration({
                        moduleSpecifier,
                    });
                } else if (combinedExportDeclarations.namedExports.size > 0) {
                    exportsFile.addExportDeclaration({
                        moduleSpecifier,
                        namedExports: [...combinedExportDeclarations.namedExports],
                    });
                }
            }
        }
    }
}

function getExportsFileForDirectory({
    pathToDirectory,
    rootDirectory,
}: {
    pathToDirectory: PathToDirectory;
    rootDirectory: Directory;
}): SourceFile {
    const filepath = getExportsFilePathForDirectory(pathToDirectory);
    return rootDirectory.getSourceFile(filepath) ?? rootDirectory.createSourceFile(filepath);
}

function getExportsFilePathForDirectory(pathToDirectory: PathToDirectory): string {
    if (pathToDirectory === "/") {
        return "/api.ts";
    } else {
        return path.join(pathToDirectory, "index.ts");
    }
}
