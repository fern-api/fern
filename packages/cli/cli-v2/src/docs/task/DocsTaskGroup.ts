import type { Context } from "../../context/Context.js";
import { TaskGroup } from "../../ui/TaskGroup.js";
import type { TaskStageDefinition } from "../../ui/TaskStage.js";
import type { TaskStageLabels } from "../../ui/TaskStageLabels.js";
import { DocsTask } from "./DocsTask.js";
import type { DocsTaskStageId } from "./DocsTaskStageId.js";

/** Stage label overrides keyed by stage ID */
export type DocsStageOverrides = Partial<Record<DocsTaskStageId, Partial<TaskStageLabels>>>;

/**
 * Manages docs publishing tasks with visual progress tracking.
 */
export class DocsTaskGroup {
    private readonly taskGroup: TaskGroup;
    private readonly tasks: Record<string, DocsTask> = {};
    private readonly defaultStages: TaskStageDefinition[] = [
        {
            id: "validation",
            labels: {
                pending: "Validate docs",
                running: "Validating docs...",
                success: "Validated docs"
            }
        },
        {
            id: "publish",
            labels: {
                pending: "Publish",
                running: "Publishing...",
                success: "Published"
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
        stageOverrides?: DocsStageOverrides;
    }): DocsTask {
        const displayName = name ?? id;
        this.taskGroup.addTask({ id, name: displayName });

        const stages = this.buildStages(stageOverrides);
        this.taskGroup.setStages(id, stages);

        const task = new DocsTask({ taskGroup: this.taskGroup, id });
        this.tasks[id] = task;
        return task;
    }

    public getTask(id: string): DocsTask | undefined {
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
    private buildStages(overrides?: DocsStageOverrides): TaskStageDefinition[] {
        if (overrides == null) {
            return this.defaultStages;
        }
        return this.defaultStages.map((stage) => {
            const override = overrides[stage.id as DocsTaskStageId];
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
