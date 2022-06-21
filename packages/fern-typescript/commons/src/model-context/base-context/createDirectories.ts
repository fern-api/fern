import { Directory } from "ts-morph";
import { exportFromModule, ExportStrategy } from "./exportFromModule";

export interface DirectoryNameWithExportStrategy {
    directoryName: string;
    exportStrategy: ExportStrategy;
}

export function createDirectories(parent: Directory, path: DirectoryNameWithExportStrategy[]): Directory {
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
