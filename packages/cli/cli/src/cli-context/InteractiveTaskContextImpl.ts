import { CreateInteractiveTaskParams, InteractiveTaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { TaskContextImpl } from "./TaskContextImpl";

export class InteractiveTaskContextImpl extends TaskContextImpl implements InteractiveTaskContext {
    private name: string;
    private subtitle: string | undefined;
    private depth: number;
    private subtasks: InteractiveTaskContextImpl[] = [];

    constructor({ name, subtitle, depth }: { name: string; subtitle: string | undefined; depth: number }) {
        super();
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
        });
        this.subtasks.push(subtask);
        await run(subtask);
    }

    public print({ spinner }: { spinner: string }): string {
        return [
            `${spinner} ${this.name} ${chalk.dim(this.subtitle)}`.padStart(this.depth * 2),
            ...this.subtasks.map((subtask) => subtask.print({ spinner })),
        ].join("\n");
    }
}
