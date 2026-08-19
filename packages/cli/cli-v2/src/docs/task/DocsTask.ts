import { CliError } from "@fern-api/task-context";
import type { Task } from "../../ui/Task.js";
import type { TaskGroup } from "../../ui/TaskGroup.js";
import { TaskStageController } from "../../ui/TaskStageController.js";

/**
 * Represents a single docs publishing task with type-safe stage controls.
 */
export class DocsTask {
    private readonly id: string;
    private readonly taskGroup: TaskGroup;

    public readonly stage: {
        readonly validation: TaskStageController;
        readonly publish: TaskStageController;
    };

    constructor({ id, taskGroup }: { id: string; taskGroup: TaskGroup }) {
        this.id = id;
        this.taskGroup = taskGroup;

        this.stage = {
            validation: new TaskStageController({ taskId: id, taskGroup, stageId: "validation" }),
            publish: new TaskStageController({ taskId: id, taskGroup, stageId: "publish" })
        };
    }

    /**
     * Get the underlying Task object for this DocsTask.
     */
    public getTask(): Task {
        const task = this.taskGroup.getTask(this.id);
        if (task == null) {
            throw new CliError({
                message: `Internal error; task '${this.id}' does not exist`,
                code: CliError.Code.InternalError
            });
        }
        return task;
    }

    /** Mark the task as running */
    public start(currentStep?: string): void {
        this.taskGroup.updateTask({
            id: this.id,
            update: { status: "running", currentStep }
        });
    }

    /** Mark the task as successfully completed */
    public complete(output?: string[]): void {
        this.taskGroup.updateTask({
            id: this.id,
            update: { status: "success", output }
        });
    }

    /** Mark the task as failed */
    public fail(error?: string): void {
        this.taskGroup.updateTask({
            id: this.id,
            update: { status: "error", error }
        });
    }
}
