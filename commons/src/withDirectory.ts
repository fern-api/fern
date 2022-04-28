import { Directory } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export function withDirectory(
    {
        containingModule,
        name,
        namespaceExport,
    }: {
        containingModule: Directory;
        name: string;
        namespaceExport?: string;
    },
    addDirectoryContents: (directory: Directory) => void
): Directory {
    const directory = containingModule.getDirectory(name) ?? containingModule.createDirectory(name);
    addDirectoryContents(directory);

    addExports(directory);
    exportFromModule({
        module: containingModule,
        pathToExport: directory.getPath(),
        namespaceExport,
    });

    return directory;
}

function addExports(directory: Directory): void {
    for (const sourceFile of directory.getSourceFiles()) {
        if (sourceFile.getBaseName() !== "index.ts") {
            exportFromModule({
                module: directory,
                pathToExport: sourceFile.getFilePath(),
            });
        }
    }

    for (const subdirectory of directory.getDirectories()) {
        exportFromModule({
            module: directory,
            pathToExport: subdirectory.getPath(),
        });
        addExports(subdirectory);
    }
}
