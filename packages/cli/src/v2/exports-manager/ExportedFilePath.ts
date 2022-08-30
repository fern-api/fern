import { RelativeFilePath } from "@fern-api/core-utils";
import path from "path";
import { ExportDeclaration } from "./ExportsManager";

export interface ExportedFilePath {
    directories: ExportedDirectory[];
    file: ExportedFilePathPart;
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
    return path.join(
        ...exportedFilePath.directories.map((directory) => directory.nameOnDisk),
        exportedFilePath.file.nameOnDisk
    );
}
