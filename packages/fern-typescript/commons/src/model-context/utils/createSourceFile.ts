import { Directory, SourceFile } from "ts-morph";
import { createDirectories, DirectoryNameWithExportStrategy } from "./createDirectories";
import { exportFromModule, ExportStrategy } from "./exportFromModule";

export interface PathToSourceFile {
    directories: DirectoryNameWithExportStrategy[];
    fileName: string;
    exportStrategy: ExportStrategy;
}

export function createSourceFile(parent: Directory, path: PathToSourceFile): SourceFile {
    const directory = createDirectories(parent, path.directories);
    const sourceFile = directory.createSourceFile(path.fileName);
    exportFromModule(sourceFile, path.exportStrategy);
    return sourceFile;
}
