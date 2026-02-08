import type { Task } from "../../ui/Task.js";
import type { TaskGroup } from "../../ui/TaskGroup.js";
import { TaskStageController } from "../../ui/TaskStageController.js";

/**
 * Represents a single SDK generation task with type-safe stage controls.
 */
export class SdkTask {
    private readonly id: string;
    private readonly taskGroup: TaskGroup;

    public readonly stage: {
        readonly validation: TaskStageController;
        readonly generator: TaskStageController;
        readonly output: TaskStageController;
    };

    constructor({ id, taskGroup }: { id: string; taskGroup: TaskGroup }) {
        this.id = id;
        this.taskGroup = taskGroup;

        this.stage = {
            validation: new TaskStageController({ taskId: id, taskGroup, stageId: "validation" }),
            generator: new TaskStageController({ taskId: id, taskGroup, stageId: "generator" }),
            output: new TaskStageController({ taskId: id, taskGroup, stageId: "output" })
        };
    }

    /**
     * Get the underlying Task object for this SdkTask.
     */
    public getTask(): Task {
        const task = this.taskGroup.getTask(this.id);
        if (task == null) {
            // This should be unreachable.
            throw new Error(`Internal error; task '${this.id}' does not exist`);
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
