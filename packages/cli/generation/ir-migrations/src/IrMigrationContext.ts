import { TaskContext } from "@fern-api/task-context";

export interface IrMigrationContext {
    taskContext: TaskContext;
    targetGenerator: {
        name: string;
        version: string;
    };
}
