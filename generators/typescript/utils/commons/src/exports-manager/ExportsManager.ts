import { RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";
import { Directory, SourceFile } from "ts-morph";

import { getRelativePathAsModuleSpecifierTo, ModuleSpecifier } from "../referencing/index.js";

export interface ExportedFilePath {
    directories: ExportedDirectory[];
    file: ExportedFilePathPart | undefined;
    /**
     * @default "src"
     */
    rootDir?: string;
}

export interface ExportedDirectory extends ExportedFilePathPart {
    // optionally export deeper items within this directory from the index.ts
    subExports?: Record<RelativeFilePath, ExportDeclaration>;
}

export interface ExportedFilePathPart {
    nameOnDisk: string;
    // how the items in this file/directory are exported from the index.ts
    exportDeclaration?: ExportDeclaration;
}

export interface ExportDeclaration {
    exportAll?: boolean;
    namespaceExport?: string;
    namedExports?: NamedExport[];
    defaultExport?: {
        recommendedImportName: string;
    };
}

export type NamedExport = string | { type?: "type" | undefined; name: string };

export namespace NamedExport {
    export function getName(namedExport: NamedExport): string {
        return typeof namedExport === "string" ? namedExport : namedExport.name;
    }
    export function isTypeExport(namedExport: NamedExport): boolean {
        if (typeof namedExport === "string") {
            return false;
        }
        return namedExport.type === "type";
    }
}

interface CombinedExportDeclarations {
    exportAll: boolean;
    namespaceExports: Set<string>;
    namedExports: Map<string, NamedExport>;
}

type PathToDirectory = string;

const DEFAULT_PACKAGE_PATH = "src";

export class ExportsManager {
    private exports: Record<PathToDirectory, Record<ModuleSpecifier, CombinedExportDeclarations>> = {};
    public packagePath: string;

    constructor({ packagePath = DEFAULT_PACKAGE_PATH }: { packagePath?: string } = {}) {
        this.packagePath = packagePath;
    }

    public convertExportedFilePathToFilePath(
        exportedFilePath: ExportedFilePath,
        packagePath: string = this.packagePath
    ): string {
        const directoryPath = this.convertExportedDirectoryPathToFilePath(
            exportedFilePath.directories,
            exportedFilePath.rootDir || packagePath
        );
        if (exportedFilePath.file == null) {
            return directoryPath;
        } else {
            return path.join(directoryPath, exportedFilePath.file.nameOnDisk);
        }
    }

    public convertExportedDirectoryPathToFilePath(
        exportedDirectoryPath: ExportedDirectory[],
        packagePath: string = this.packagePath
    ): string {
        return path.join(
            // within a ts-morph Project, we treat "/src" as the root of the project
            "/" + packagePath,
            ...exportedDirectoryPath.map((directory) => RelativeFilePath.of(directory.nameOnDisk))
        );
    }

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

    public addExportsForFilepath(
        filepath: ExportedFilePath,
        addExportTypeModifier?: boolean,
        customExportPaths?: string[]
    ): void {
        this.addExportsForDirectories(filepath.directories, addExportTypeModifier, customExportPaths);
        this.addExport(
            this.convertExportedFilePathToFilePath(filepath),
            filepath.file?.exportDeclaration,
            addExportTypeModifier
        );
    }

    public addExportsForDirectories(
        directories: ExportedDirectory[],
        addExportTypeModifier?: boolean,
        customExportPaths?: string[]
    ): void {
        let directoryFilepath = this.packagePath;
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

        const lastPart = directories.at(-1);
        if (customExportPaths && lastPart) {
            for (const customExportPath of customExportPaths) {
                const fullCustomExportPath = path.join(this.packagePath, customExportPath);
                this.addExportDeclarationForDirectory({
                    directory: fullCustomExportPath,
                    moduleSpecifierToExport: getRelativePathAsModuleSpecifierTo({
                        from: fullCustomExportPath,
                        to: directoryFilepath
                    }),
                    exportDeclaration: lastPart.exportDeclaration,
                    addExportTypeModifier
                });
            }
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
            namedExports: new Map<string, NamedExport>()
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
                    exportsForModuleSpecifier.namedExports.set(NamedExport.getName(namedExport), {
                        name: NamedExport.getName(namedExport),
                        type: "type"
                    });
                } else {
                    exportsForModuleSpecifier.namedExports.set(NamedExport.getName(namedExport), namedExport);
                }
            }
        }
    }

    public writeExportsToProject(rootDirectory: Directory): void {
        // Group exports by resolved source file to handle path variants (e.g. "src" vs "/src")
        // that map to the same index.ts file. The old addExportDeclaration() approach appended
        // per call, but replaceWithText() overwrites, so we must accumulate all lines first.
        // Note: replaceWithText is safe here because index.ts files are exclusively written by
        // this method — no other code populates them before writeExportsToProject is called.
        const exportLinesByFile = new Map<SourceFile, string[]>();

        const sortedExports = Object.entries(this.exports).sort(([a], [b]) => a.localeCompare(b));
        for (const [pathToDirectory, moduleSpecifierToExports] of sortedExports) {
            const exportsFile = getExportsFileForDirectory({
                pathToDirectory,
                rootDirectory
            });

            let exportLines = exportLinesByFile.get(exportsFile);
            if (exportLines == null) {
                exportLines = [];
                exportLinesByFile.set(exportsFile, exportLines);
            }

            const sortedModuleSpecifiers = Object.entries(moduleSpecifierToExports).sort(([a], [b]) =>
                a.localeCompare(b)
            );
            for (const [moduleSpecifier, combinedExportDeclarations] of sortedModuleSpecifiers) {
                const sortedNamespaceExports = [...combinedExportDeclarations.namespaceExports].sort((a, b) =>
                    a.localeCompare(b)
                );
                for (const namespaceExport of sortedNamespaceExports) {
                    exportLines.push(`export * as ${namespaceExport} from "${moduleSpecifier}";`);
                }

                if (combinedExportDeclarations.exportAll) {
                    exportLines.push(`export * from "${moduleSpecifier}";`);
                } else if (combinedExportDeclarations.namedExports.size > 0) {
                    const sortedNamedExports = [...combinedExportDeclarations.namedExports.entries()]
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([, namedExport]) => namedExport);
                    const areAllTypeExports = sortedNamedExports.every((namedExport) =>
                        NamedExport.isTypeExport(namedExport)
                    );
                    const specifiers = sortedNamedExports
                        .map((namedExport) => {
                            const prefix = !areAllTypeExports && NamedExport.isTypeExport(namedExport) ? "type " : "";
                            return `${prefix}${NamedExport.getName(namedExport)}`;
                        })
                        .join(", ");
                    const typeOnlyPrefix = areAllTypeExports ? "type " : "";
                    exportLines.push(`export ${typeOnlyPrefix}{ ${specifiers} } from "${moduleSpecifier}";`);
                }
            }
        }

        for (const [exportsFile, exportLines] of exportLinesByFile) {
            if (exportLines.length === 0) {
                exportLines.push("export {};");
            }
            exportsFile.replaceWithText(exportLines.join("\n") + "\n");
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
