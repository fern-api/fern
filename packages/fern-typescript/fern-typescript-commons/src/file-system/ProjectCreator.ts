import { Project } from "ts-morph";
import { mergeImportsInFile } from "./mergeImportsInFile";

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
        for (const file of this.project.getSourceFiles()) {
            mergeImportsInFile(file);
            file.formatText();
        }
        await this.project.save();
        return this.project;
    }
}
