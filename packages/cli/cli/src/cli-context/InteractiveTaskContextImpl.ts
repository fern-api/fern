import {
    CreateInteractiveTaskParams,
    FinishableInteractiveTaskContext,
    InteractiveTaskContext,
    TaskResult,
} from "@fern-api/task-context";
import chalk from "chalk";
import { addPrefixToLog } from "./addPrefixToLog";
import { TaskContextImpl } from "./TaskContextImpl";

export declare namespace InteractiveTaskContextImpl {
    export interface Init extends TaskContextImpl.Init {
        name: string;
        subtitle: string | undefined;
    }
}

export class InteractiveTaskContextImpl extends TaskContextImpl implements FinishableInteractiveTaskContext {
    private name: string;
    private subtitle: string | undefined;
    private subtasks: InteractiveTaskContextImpl[] = [];
    private isRunning = true;

    constructor({ name, subtitle, ...superArgs }: InteractiveTaskContextImpl.Init) {
        super(superArgs);
        this.name = name;
        this.subtitle = subtitle;
    }

    public setSubtitle(subtitle: string | undefined): void {
        this.subtitle = subtitle;
    }

    public addInteractiveTask({ name, subtitle }: CreateInteractiveTaskParams): FinishableInteractiveTaskContext {
        const subtask = new InteractiveTaskContextImpl({
            name,
            subtitle,
            log: (content) => this.log(content),
            logPrefix: `${this.logPrefix}${chalk.dim(`[${name}]`)} `,
        });
        this.subtasks.push(subtask);
        return subtask;
    }

    public finish(): void {
        this.printLogs();
        this.isRunning = false;
    }

    public isFinished(): boolean {
        return !this.isRunning;
    }

    public async runInteractiveTask(
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<void> {
        const subtask = this.addInteractiveTask(params);
        await run(subtask);
        subtask.finish();
    }

    public print({ spinner }: { spinner: string }): string {
        const lines = [this.name];
        if (this.subtitle != null) {
            lines.push(chalk.dim(this.subtitle));
        }
        lines.push(...this.subtasks.map((subtask) => subtask.print({ spinner })));

        return addPrefixToLog({
            prefix: `${this.getIcon({ spinner }).padEnd(spinner.length)} `,
            content: lines.join("\n"),
        });
    }

    private getIcon({ spinner }: { spinner: string }): string {
        if (!this.isFinished()) {
            return spinner;
        }
        switch (this.getResult()) {
            case TaskResult.Success:
                return chalk.green("✓");
            case TaskResult.Failure:
                return chalk.red("x");
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
}
