import { Project } from "ts-morph";

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
        return this.project;
    }
}
