import path from "path";
import { ExportDeclaration } from "./ExportsManager";

export interface ExportedFilePath {
    directories: ExportedFilePathPart[];
    file: ExportedFilePathPart;
}

export interface ExportedFilePathPart {
    nameOnDisk: string;
    exportDeclaration?: ExportDeclaration;
}

export function convertExportedFilePathToFilePath(exportedFilePath: ExportedFilePath): string {
    return path.join(
        ...exportedFilePath.directories.map((directory) => directory.nameOnDisk),
        exportedFilePath.file.nameOnDisk
    );
}
