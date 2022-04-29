import { Directory } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export declare namespace getOrCreateDirectory {
    export interface Options {
        exportOptions?: exportFromModule.Options;
    }
}

export function getOrCreateDirectory(
    containingModule: Directory,
    name: string,
    { exportOptions }: getOrCreateDirectory.Options = {}
): Directory {
    const directory = containingModule.getDirectory(name) ?? containingModule.createDirectory(name);
    exportFromModule({
        module: containingModule,
        pathToExport: directory.getPath(),
        options: exportOptions,
    });

    return directory;
}
