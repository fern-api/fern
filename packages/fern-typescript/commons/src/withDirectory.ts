import { Directory } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export function withDirectory(
    containingModule: Directory,
    name: string,
    addDirectoryContents: (directory: Directory) => void
): Directory {
    const directory = containingModule.createDirectory(name);
    addDirectoryContents(directory);
    addExports(directory);
    return directory;
}

// TODO maybe we should instead specify shouldExport=true in withFile
// because maybe we'll make edits to files in this directory after
// withDirectory is complete
function addExports(directory: Directory): void {
    for (const sourceFile of directory.getSourceFiles()) {
        exportFromModule({
            module: directory,
            pathToExport: sourceFile.getFilePath(),
        });
    }

    for (const subdirectory of directory.getDirectories()) {
        exportFromModule({
            module: directory,
            pathToExport: subdirectory.getPath(),
        });
        addExports(subdirectory);
    }
}
