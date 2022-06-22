import { Directory, SourceFile } from "ts-morph";
import { exportFromModule, ExportStrategy } from "./exportFromModule";

export interface PathToSourceFile {
    directories: DirectoryNameWithExportStrategy[];
    fileName: string;
    exportStrategy: ExportStrategy;
}

export interface DirectoryNameWithExportStrategy {
    directoryName: string;
    exportStrategy: ExportStrategy;
}

export function createSourceFile(parent: Directory, path: PathToSourceFile): SourceFile {
    const directory = createDirectories(parent, path.directories);
    const sourceFile = directory.createSourceFile(path.fileName);
    exportFromModule(sourceFile, path.exportStrategy);
    return sourceFile;
}

function createDirectories(parent: Directory, path: DirectoryNameWithExportStrategy[]): Directory {
    let directory = parent;

    for (const part of path) {
        let nextDirectory = directory.getDirectory(part.directoryName);
        if (nextDirectory == null) {
            nextDirectory = directory.createDirectory(part.directoryName);
            exportFromModule(nextDirectory, part.exportStrategy);
        }
        directory = nextDirectory;
    }

    return directory;
}
