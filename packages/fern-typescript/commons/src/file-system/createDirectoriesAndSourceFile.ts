import { Directory, SourceFile } from "ts-morph";
import { exportFromModule } from "..";
import { ExportStrategy } from "../import-export/exportFromModule";
import { createDirectories, DirectoryNameWithExportStrategy } from "./createDirectories";

export interface PathToSourceFile {
    directories: DirectoryNameWithExportStrategy[];
    fileName: string;
    exportStrategy: ExportStrategy;
}

export function createDirectoriesAndSourceFile(parent: Directory, path: PathToSourceFile): SourceFile {
    const directory = createDirectories(parent, path.directories);
    const sourceFile = directory.createSourceFile(path.fileName);
    exportFromModule(sourceFile, path.exportStrategy);
    return sourceFile;
}
