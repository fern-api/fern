import { Directory, SourceFile } from "ts-morph";
import { exportFromModule } from "../import-export/exportFromModule";

export function createSourceFileAndExportFromModule(
    directory: Directory,
    filenameWithoutExtension: string
): SourceFile {
    const file = directory.createSourceFile(`${filenameWithoutExtension}.ts`);
    exportFromModule(file);
    return file;
}
