import path from "path";
import { Directory, SourceFile } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { convertExportedFilePathToFilePath, ExportedDirectory, ExportedFilePath } from "./ExportedFilePath";

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

export class ExportsManager {
    private exports: Record<PathToDirectory, Record<ModuleSpecifier, CombinedExportDeclarations>> = {};

    public addExport(from: SourceFile | string, exportDeclaration: ExportDeclaration): void {
        const fromPath = typeof from === "string" ? from : from.getFilePath();
        if (path.extname(fromPath).length === 0) {
            throw new Error("Cannot export from directory: " + fromPath);
        }

        const pathToDirectory = path.dirname(fromPath);

        this.addExportDeclarationForDirectory({
            directory: pathToDirectory,
            moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo(pathToDirectory, fromPath),
            exportDeclaration,
        });
    }

    public addExportsForFilepath(filepath: ExportedFilePath): void {
        this.addExportsForDirectories(filepath.directories);
        if (filepath.file?.exportDeclaration != null) {
            this.addExport(convertExportedFilePathToFilePath(filepath), filepath.file.exportDeclaration);
        }
    }

    public addExportsForDirectories(directories: ExportedDirectory[]): void {
        let directoryFilepath = "/";
        for (const part of directories) {
            const nextDirectoryPath = path.join(directoryFilepath, part.nameOnDisk);
            if (part.exportDeclaration != null) {
                this.addExportDeclarationForDirectory({
                    directory: directoryFilepath,
                    moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo(directoryFilepath, nextDirectoryPath),
                    exportDeclaration: part.exportDeclaration,
                });
            }
            if (part.subExports != null) {
                for (const [relativeFilePath, exportDeclaration] of Object.entries(part.subExports)) {
                    this.addExportDeclarationForDirectory({
                        directory: directoryFilepath,
                        moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo(
                            directoryFilepath,
                            path.join(nextDirectoryPath, relativeFilePath)
                        ),
                        exportDeclaration,
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
    }: {
        directory: Directory | PathToDirectory;
        moduleSpecifierToExport: ModuleSpecifier;
        exportDeclaration: ExportDeclaration;
    }): void {
        const pathToDirectory = typeof directory === "string" ? directory : directory.getPath();
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
        for (const [pathToDirectory, moduleSpecifierToExports] of Object.entries(this.exports)) {
            for (const [moduleSpecifier, combinedExportDeclarations] of Object.entries(moduleSpecifierToExports)) {
                const namespaceExports = [...combinedExportDeclarations.namespaceExports];
                if (namespaceExports.length > 1) {
                    throw new Error(
                        `Multiple namespace exports from ${moduleSpecifier}: ${namespaceExports.join(", ")}`
                    );
                }

                const exportsFile = getExportsFileForDirectory({
                    pathToDirectory,
                    rootDirectory,
                });

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
    const filepath = path.join(pathToDirectory, "index.ts");
    return rootDirectory.getSourceFile(filepath) ?? rootDirectory.createSourceFile(filepath);
}
