import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

export interface Migration {
    name: string;
    summary: string;
    run: (args: MigrationArgs) => void | Promise<void>;
}

export interface MigrationArgs {
    context: TaskContext;
    project: Project;
}
