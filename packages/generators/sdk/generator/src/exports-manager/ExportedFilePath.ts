import { RelativeFilePath } from "@fern-api/core-utils";
import path from "path";
import { ExportDeclaration } from "./ExportsManager";

export interface ExportedFilePath {
    directories: ExportedDirectory[];
    file: ExportedFilePathPart | undefined;
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
    const directoryPath = convertExportedDirectoryPathToFilePath(exportedFilePath.directories);
    if (exportedFilePath.file == null) {
        return directoryPath;
    } else {
        return path.join(directoryPath, exportedFilePath.file.nameOnDisk);
    }
}

export function convertExportedDirectoryPathToFilePath(exportedDirectoryPath: ExportedDirectory[]): string {
    return path.join(
        // within a ts-morph Project, we treat "/" as the root of the project
        "/",
        ...exportedDirectoryPath.map((directory) => RelativeFilePath.of(directory.nameOnDisk))
    );
}
