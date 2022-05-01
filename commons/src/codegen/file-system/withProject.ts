import { Directory, Project, SourceFile } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export function withProject(create: (project: Project) => void): Project {
    const project = new Project({
        useInMemoryFileSystem: true,
    });

    create(project);

    finalizeProject(project);

    return project;
}

function finalizeProject(project: Project): void {
    for (const directory of project.getDirectories()) {
        finalizeDirectory(directory);
    }
}

function finalizeDirectory(directory: Directory): void {
    for (const subdirectory of directory.getDirectories()) {
        exportFromModule({
            module: directory,
            pathToExport: subdirectory.getPath(),
        });
        finalizeDirectory(subdirectory);
    }

    for (const sourceFile of directory.getSourceFiles()) {
        if (sourceFile.getBaseName() !== "index.ts") {
            exportFromModule({
                module: directory,
                pathToExport: sourceFile.getFilePath(),
            });
        }
        finalizeSourceFile(sourceFile);
    }
}

function finalizeSourceFile(sourceFile: SourceFile): void {
    sourceFile.formatText();
    sourceFile.organizeImports();
}
