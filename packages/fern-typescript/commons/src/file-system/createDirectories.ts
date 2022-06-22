import { FernFilepath } from "@fern-api/api";
import { camelCase } from "lodash";
import { Directory } from "ts-morph";
import { exportFromModule } from "../model-context/utils/exportFromModule";

export function createDirectoriesForFernFilepath(parent: Directory, fernFilepath: FernFilepath): Directory {
    let directory = parent;

    for (const part of fernFilepath.split("/")) {
        let nextDirectory = directory.getDirectory(part);
        if (nextDirectory == null) {
            nextDirectory = directory.createDirectory(part);
            exportFromModule(nextDirectory, { type: "namespace", namespaceExport: camelCase(part) });
        }
        directory = nextDirectory;
    }

    return directory;
}
