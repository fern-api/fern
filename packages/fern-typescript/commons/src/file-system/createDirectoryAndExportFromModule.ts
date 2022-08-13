import { Directory } from "ts-morph";
import { exportFromModule } from "../import-export/exportFromModule";

export function createDirectoryAndExportFromModule(parent: Directory, name: string): Directory {
    const newDirectory = parent.createDirectory(name);
    exportFromModule(newDirectory, { type: "namespace", namespaceExport: name });
    return newDirectory;
}
