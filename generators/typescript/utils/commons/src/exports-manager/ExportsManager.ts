import path from "path";
import { Directory, SourceFile } from "ts-morph";

import { ModuleSpecifier, getRelativePathAsModuleSpecifierTo } from "../referencing";
import { ExportedDirectory, ExportedFilePath, convertExportedFilePathToFilePath } from "./ExportedFilePath";

export interface ExportDeclaration {
    exportAll?: boolean;
    namespaceExport?: string;
    namedExports?: string[];
    defaultExport?: {
        recommendedImportName: string;
    };
}

interface CombinedExportDeclarations {
    exportAll: boolean;
    namespaceExports: Set<string>;
    namedExports: Set<string>;
}

type PathToDirectory = string;

export class ExportsManager {
    private exports: Record<PathToDirectory, Record<ModuleSpecifier, CombinedExportDeclarations>> = {};

    public addExport(
        from: SourceFile | string,
        exportDeclaration: ExportDeclaration | undefined,
        addExportTypeModifier?: boolean
    ): void {
        const fromPath = typeof from === "string" ? from : from.getFilePath();
        if (path.extname(fromPath).length === 0) {
            throw new Error("Cannot export from directory: " + fromPath);
        }

        const pathToDirectory = path.dirname(fromPath);

        this.addExportDeclarationForDirectory({
            directory: pathToDirectory,
            moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo({
                from: pathToDirectory,
                to: fromPath
            }),
            exportDeclaration,
            addExportTypeModifier
        });
    }

    public addExportsForFilepath(filepath: ExportedFilePath, addExportTypeModifier?: boolean): void {
        this.addExportsForDirectories(filepath.directories, addExportTypeModifier);
        this.addExport(
            convertExportedFilePathToFilePath(filepath),
            filepath.file?.exportDeclaration,
            addExportTypeModifier
        );
    }

    public addExportsForDirectories(directories: ExportedDirectory[], addExportTypeModifier?: boolean): void {
        let directoryFilepath = "/src";
        for (const part of directories) {
            const nextDirectoryPath = path.join(directoryFilepath, part.nameOnDisk);
            this.addExportDeclarationForDirectory({
                directory: directoryFilepath,
                moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo({
                    from: directoryFilepath,
                    to: nextDirectoryPath
                }),
                exportDeclaration: part.exportDeclaration,
                addExportTypeModifier
            });

            if (part.subExports != null) {
                for (const [relativeFilePath, exportDeclaration] of Object.entries(part.subExports)) {
                    this.addExportDeclarationForDirectory({
                        directory: directoryFilepath,
                        moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo({
                            from: directoryFilepath,
                            to: path.join(nextDirectoryPath, relativeFilePath)
                        }),
                        exportDeclaration,
                        addExportTypeModifier
                    });
                }
            }
            directoryFilepath = nextDirectoryPath;
        }
    }

    private addExportDeclarationForDirectory({
        directory,
        moduleSpecifierToExport,
        exportDeclaration,
        addExportTypeModifier
    }: {
        directory: Directory | PathToDirectory;
        moduleSpecifierToExport: ModuleSpecifier;
        exportDeclaration: ExportDeclaration | undefined;
        addExportTypeModifier: boolean | undefined;
    }): void {
        const pathToDirectory = typeof directory === "string" ? directory : directory.getPath();
        const exportsForDirectory = (this.exports[pathToDirectory] ??= {});

        const exportsForModuleSpecifier = (exportsForDirectory[moduleSpecifierToExport] ??= {
            exportAll: false,
            namespaceExports: new Set(),
            namedExports: new Set()
        });

        if (exportDeclaration == null) {
            return;
        }

        if (exportDeclaration.exportAll != null) {
            exportsForModuleSpecifier.exportAll ||= exportDeclaration.exportAll;
        }

        if (exportDeclaration.namespaceExport != null) {
            exportsForModuleSpecifier.namespaceExports.add(exportDeclaration.namespaceExport);
        }
        if (exportDeclaration.defaultExport != null) {
            exportsForModuleSpecifier.namespaceExports.add("default");
        }

        if (exportDeclaration.namedExports != null) {
            for (const namedExport of exportDeclaration.namedExports) {
                if (addExportTypeModifier) {
                    exportsForModuleSpecifier.namedExports.add("type " + namedExport);
                } else {
                    exportsForModuleSpecifier.namedExports.add(namedExport);
                }
            }
        }
    }

    public writeExportsToProject(rootDirectory: Directory): void {
        for (const [pathToDirectory, moduleSpecifierToExports] of Object.entries(this.exports)) {
            const exportsFile = getExportsFileForDirectory({
                pathToDirectory,
                rootDirectory
            });

            for (const [moduleSpecifier, combinedExportDeclarations] of Object.entries(moduleSpecifierToExports)) {
                for (const namespaceExport of combinedExportDeclarations.namespaceExports) {
                    exportsFile.addExportDeclaration({
                        moduleSpecifier,
                        namespaceExport
                    });
                }

                if (combinedExportDeclarations.exportAll) {
                    exportsFile.addExportDeclaration({
                        moduleSpecifier
                    });
                } else if (combinedExportDeclarations.namedExports.size > 0) {
                    exportsFile.addExportDeclaration({
                        moduleSpecifier,
                        namedExports: [...combinedExportDeclarations.namedExports]
                    });
                }
            }

            if (exportsFile.getStatements().length === 0) {
                exportsFile.addExportDeclaration({});
            }
        }
    }
}

function getExportsFileForDirectory({
    pathToDirectory,
    rootDirectory
}: {
    pathToDirectory: PathToDirectory;
    rootDirectory: Directory;
}): SourceFile {
    const filepath = path.join(pathToDirectory, "index.ts");
    return rootDirectory.getSourceFile(filepath) ?? rootDirectory.createSourceFile(filepath);
}
