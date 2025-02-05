import path from "path";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { ExportDeclaration } from "./ExportsManager";

export interface ExportedFilePath {
    directories: ExportedDirectory[];
    file: ExportedFilePathPart | undefined;
    /**
     * @default "src"
     */
    rootDir?: "src" | "tests" | "";
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

export function convertExportedFilePathToFilePath(exportedFilePath: ExportedFilePath): string {
    const directoryPath = convertExportedDirectoryPathToFilePath(
        exportedFilePath.directories,
        exportedFilePath.rootDir
    );
    if (exportedFilePath.file == null) {
        return directoryPath;
    } else {
        return path.join(directoryPath, exportedFilePath.file.nameOnDisk);
    }
}

export function convertExportedDirectoryPathToFilePath(
    exportedDirectoryPath: ExportedDirectory[],
    rootDir: "src" | "tests" | "" = "src"
): string {
    return path.join(
        // within a ts-morph Project, we treat "/src" as the root of the project
        "/" + rootDir,
        ...exportedDirectoryPath.map((directory) => RelativeFilePath.of(directory.nameOnDisk))
    );
}
