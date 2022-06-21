import { Directory, Project } from "ts-morph";
import { exportFromModule } from "./exportFromModule";

export class ProjectCreator {
    private project: Project;

    constructor() {
        this.project = new Project({
            useInMemoryFileSystem: true,
        });
    }

    public withProject<T>(run: (project: Project) => T): T {
        return run(this.project);
    }

    public async finalize(): Promise<Project> {
        for (const directory of this.project.getRootDirectories()) {
            this.finalizeDirectory(directory);
        }
        await this.project.save();
        return this.project;
    }

    private finalizeDirectory(directory: Directory, depth = 0): void {
        for (const subdirectory of directory.getDirectories()) {
            this.finalizeDirectory(subdirectory, depth + 1);
            if (subdirectory.wasForgotten()) {
                continue;
            }
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

        if (directory.getSourceFiles().length === 0 && directory.getDirectories().length === 0) {
            directory.delete();
        }
    }
}
