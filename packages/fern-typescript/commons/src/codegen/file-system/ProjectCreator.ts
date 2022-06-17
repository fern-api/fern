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
        await this.project.save();
        for (const directory of this.project.getDirectories()) {
            this.finalizeDirectory(directory);
        }
        return this.project;
    }

    private finalizeDirectory(directory: Directory): void {
        for (const subdirectory of directory.getDirectories()) {
            this.finalizeDirectory(subdirectory);
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
}
