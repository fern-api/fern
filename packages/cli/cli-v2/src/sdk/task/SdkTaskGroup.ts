import type { Context } from "../../context/Context.js";
import { TaskGroup } from "../../ui/TaskGroup.js";
import type { TaskStageDefinition } from "../../ui/TaskStage.js";
import type { TaskStageLabels } from "../../ui/TaskStageLabels.js";
import { SdkTask } from "./SdkTask.js";
import type { SdkTaskStageId } from "./SdkTaskStageId.js";

/** Stage label overrides keyed by stage ID */
export type SdkStageOverrides = Partial<Record<SdkTaskStageId, Partial<TaskStageLabels>>>;

/**
 * Manages SDK generation tasks with visual progress tracking.
 */
export class SdkTaskGroup {
    private readonly taskGroup: TaskGroup;
    private readonly tasks: Record<string, SdkTask> = {};
    private readonly defaultStages: TaskStageDefinition[] = [
        {
            id: "validation",
            labels: {
                pending: "Validate API",
                running: "Validating API...",
                success: "Validated API"
            }
        },
        {
            id: "generator",
            labels: {
                pending: "Run generator",
                running: "Running generator...",
                success: "Generator completed"
            }
        },
        {
            id: "output",
            labels: {
                pending: "Write output",
                running: "Writing output...",
                success: "Wrote output"
            }
        }
    ];

    constructor({ context }: { context: Context }) {
        this.tasks = {};
        this.taskGroup = new TaskGroup({ context });
    }

    public addTask({
        id,
        name,
        stageOverrides
    }: {
        id: string;
        name?: string;
        stageOverrides?: SdkStageOverrides;
    }): SdkTask {
        const displayName = name ?? id;
        this.taskGroup.addTask({ id, name: displayName });

        const stages = this.buildStages(stageOverrides);
        this.taskGroup.setStages(id, stages);

        const task = new SdkTask({ taskGroup: this.taskGroup, id });
        this.tasks[id] = task;
        return task;
    }

    public getTask(id: string): SdkTask | undefined {
        return this.tasks[id];
    }

    public async start(header: { title: string; subtitle?: string }): Promise<void> {
        await this.taskGroup.start(header);
    }

    public finish({
        successMessage,
        errorMessage
    }: {
        successMessage: string;
        errorMessage: string;
    }): TaskGroup.CompleteResult {
        return this.taskGroup.complete({
            successMessage,
            errorMessage
        });
    }

    /**
     * Build stage definitions, merging any overrides with defaults.
     */
    private buildStages(overrides?: SdkStageOverrides): TaskStageDefinition[] {
        if (overrides == null) {
            return this.defaultStages;
        }
        return this.defaultStages.map((stage) => {
            const override = overrides[stage.id as SdkTaskStageId];
            if (override == null) {
                return stage;
            }
            return {
                ...stage,
                labels: { ...stage.labels, ...override }
            };
        });
    }
}
