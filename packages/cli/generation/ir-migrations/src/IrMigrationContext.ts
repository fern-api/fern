import { CasingsGenerator } from "@fern-api/casings-generator";
import { TaskContext } from "@fern-api/task-context";

export interface IrMigrationContext {
    taskContext: TaskContext;
    targetGenerator: GeneratorNameAndVersion | undefined;
    casingsGenerator?: CasingsGenerator;
}

export interface GeneratorNameAndVersion {
    name: string;
    version: string;
}
