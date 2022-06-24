import { Directory } from "ts-morph";
import { exportFromModule } from "../import-export/exportFromModule";

export function createDirectoryAndExportFromModule(parent: Directory, toCreate: string): Directory {
    const newDirectory = parent.createDirectory(toCreate);
    exportFromModule(newDirectory);
    return newDirectory;
}
