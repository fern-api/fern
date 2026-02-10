import type { TaskGroup } from "./TaskGroup.js";

/**
 * Controls a single task stage's status.
 */
export class TaskStageController {
    private readonly taskGroup: TaskGroup;
    private readonly taskId: string;
    private readonly stageId: string;

    constructor({
        taskGroup,
        taskId,
        stageId
    }: {
        taskGroup: TaskGroup;
        taskId: string;
        stageId: string;
    }) {
        this.taskGroup = taskGroup;
        this.taskId = taskId;
        this.stageId = stageId;
    }

    public start(detail?: string): void {
        this.taskGroup.updateStage({
            taskId: this.taskId,
            stageId: this.stageId,
            status: "running",
            options: { detail }
        });
    }

    public complete(detail?: string): void {
        this.taskGroup.updateStage({
            taskId: this.taskId,
            stageId: this.stageId,
            status: "success",
            options: { detail }
        });
    }

    public fail(error?: string): void {
        this.taskGroup.updateStage({
            taskId: this.taskId,
            stageId: this.stageId,
            status: "error"
        });
        // If at least one stage fails, the task should fail.
        const task = this.taskGroup.getTask(this.taskId);
        if (task == null) {
            // This should be unreachable.
            return;
        }
        this.taskGroup.updateTask({
            id: this.taskId,
            update: { status: "error", error }
        });
    }
}
