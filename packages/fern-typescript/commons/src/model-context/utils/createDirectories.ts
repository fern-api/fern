import { FernFilepath } from "@fern-api/api";
import { Directory } from "ts-morph";
import { exportFromModule, ExportStrategy } from "./exportFromModule";
import { getPackagePath } from "./getPackagePath";

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

export function createDirectoriesForFernFilepath(parent: Directory, fernFilepath: FernFilepath): Directory {
    let directory = parent;

    for (const part of getPackagePath(fernFilepath)) {
        let nextDirectory = directory.getDirectory(part.directoryName);
        if (nextDirectory == null) {
            nextDirectory = directory.createDirectory(part.directoryName);
            exportFromModule(nextDirectory, { type: "namespace", namespaceExport: part.namespaceExport });
        }
        directory = nextDirectory;
    }

    return directory;
}
