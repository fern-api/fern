import { CreateInteractiveTaskParams, InteractiveTaskContext, TaskResult } from "@fern-api/task-context";
import chalk from "chalk";
import { TaskContextImpl } from "./TaskContextImpl";

export declare namespace InteractiveTaskContextImpl {
    export interface Init extends TaskContextImpl.Init {
        name: string;
        subtitle: string | undefined;
        depth: number;
    }
}

export class InteractiveTaskContextImpl extends TaskContextImpl implements InteractiveTaskContext {
    private name: string;
    private subtitle: string | undefined;
    private depth: number;
    private subtasks: InteractiveTaskContextImpl[] = [];
    private isRunning = true;

    constructor({ name, subtitle, depth, ...superArgs }: InteractiveTaskContextImpl.Init) {
        super(superArgs);
        this.name = name;
        this.subtitle = subtitle;
        this.depth = depth;
    }

    public setSubtitle(subtitle: string | undefined): void {
        this.subtitle = subtitle;
    }

    public async addInteractiveTask({ name, subtitle, run }: CreateInteractiveTaskParams): Promise<void> {
        const subtask = new InteractiveTaskContextImpl({
            name,
            subtitle,
            depth: this.depth + 1,
            log: (content) => this.log(content),
            logPrefix: `${this.logPrefix}${chalk.dim(`[${name}]`)} `,
        });
        this.subtasks.push(subtask);
        await run(subtask);
        subtask.printLogs();
        subtask.finish();
    }

    public print({ spinner }: { spinner: string }): string {
        const headerParts = [" ".repeat(this.depth * 2), this.getIcon({ spinner }), this.name];
        if (this.subtitle != null) {
            headerParts.push(chalk.dim(this.subtitle));
        }
        return [headerParts.join(" "), ...this.subtasks.map((subtask) => subtask.print({ spinner }))].join("\n");
    }

    private getIcon({ spinner }: { spinner: string }): string {
        if (this.isRunning) {
            return spinner;
        }
        switch (this.getResult()) {
            case TaskResult.Success:
                return "✅";
            case TaskResult.Failure:
                return "❌";
        }
    }

    public getResult(): TaskResult {
        if (this.result === TaskResult.Failure) {
            return TaskResult.Failure;
        }
        for (const subtask of this.subtasks) {
            if (subtask.getResult() === TaskResult.Failure) {
                return TaskResult.Failure;
            }
        }
        return TaskResult.Success;
    }

    public finish(): void {
        this.isRunning = false;
    }
}
