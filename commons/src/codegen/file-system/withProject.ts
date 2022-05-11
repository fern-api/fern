import { Directory, Project } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export async function withProject(create: (project: Project) => void | Promise<void>): Promise<Project> {
    const project = new Project({
        useInMemoryFileSystem: true,
    });
    await create(project);
    await finalizeProject(project);
    return project;
}

async function finalizeProject(project: Project): Promise<void> {
    await project.save();
    for (const directory of project.getDirectories()) {
        finalizeDirectory(directory);
    }
}

function finalizeDirectory(directory: Directory): void {
    for (const subdirectory of directory.getDirectories()) {
        finalizeDirectory(subdirectory);
        if (subdirectory.getSourceFile("index.ts") != null) {
            exportFromModule({
                module: directory,
                pathToExport: subdirectory.getPath(),
            });
        }
    }

    for (const sourceFile of directory.getSourceFiles()) {
        if (sourceFile.getBaseName() !== "index.ts") {
            exportFromModule({
                module: directory,
                pathToExport: sourceFile.getFilePath(),
            });
        }
    }
}
