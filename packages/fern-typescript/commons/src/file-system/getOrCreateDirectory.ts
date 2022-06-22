import { Directory } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export declare namespace getOrCreateDirectory {
    export interface Options {
        exportOptions?: exportFromModule.Options;
    }
}

export function getOrCreateDirectory(
    containingModule: Directory,
    path: string,
    { exportOptions }: getOrCreateDirectory.Options = {}
): Directory {
    const directory = containingModule.getDirectory(path) ?? containingModule.createDirectory(path);
    if (exportOptions != null) {
        exportFromModule({
            module: containingModule,
            pathToExport: directory.getPath(),
            options: exportOptions,
        });
    }
    return directory;
}
