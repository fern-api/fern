import { Logger } from "@fern-api/logger";
import type {
    CreateInteractiveTaskParams,
    Finishable,
    InteractiveTaskContext,
    PosthogEvent,
    Startable,
    TaskContext
} from "@fern-api/task-context";
import { FernCliError, TaskResult } from "@fern-api/task-context";
import type { Task } from "../../ui/Task";
import type { Context } from "../Context";
import { TaskContextLogger } from "./TaskContextLogger";

/**
 * Adapts the CLI context to the legacy TaskContext interface.
 */
export class TaskContextAdapter implements TaskContext {
    private result: TaskResult = TaskResult.Success;

    public readonly logger: Logger;

    constructor({ context, task }: { context: Context; task: Task }) {
        this.logger = new TaskContextLogger({ context, task });
    }

    public async takeOverTerminal(run: () => void | Promise<void>): Promise<void> {
        await run();
    }

    public failAndThrow(message?: string, error?: unknown): never {
        this.failWithoutThrowing(message, error);
        throw new FernCliError();
    }

    public failWithoutThrowing(message?: string, error?: unknown): void {
        const errorDetails = error instanceof Error ? error.message : error != null ? String(error) : undefined;
        const fullMessage =
            message != null && errorDetails != null ? `${message}: ${errorDetails}` : (message ?? errorDetails);
        if (fullMessage != null) {
            this.logger.error(fullMessage);
        }
        this.result = TaskResult.Failure;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public addInteractiveTask(params: CreateInteractiveTaskParams): Startable<InteractiveTaskContext> {
        const subtask: InteractiveTaskContext & Startable<InteractiveTaskContext> & Finishable = {
            logger: this.logger,
            takeOverTerminal: this.takeOverTerminal.bind(this),
            failAndThrow: this.failAndThrow.bind(this),
            failWithoutThrowing: this.failWithoutThrowing.bind(this),
            getResult: () => this.result,
            addInteractiveTask: this.addInteractiveTask.bind(this),
            runInteractiveTask: this.runInteractiveTask.bind(this),
            instrumentPostHogEvent: this.instrumentPostHogEvent.bind(this),
            setSubtitle: (_subtitle: string | undefined) => {
                // no-op
            },
            start: () => {
                // no-op
                return subtask;
            },
            isStarted: () => true,
            finish: () => {
                // no-op
            },
            isFinished: () => true
        };
        return subtask;
    }

    public async runInteractiveTask(
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<boolean> {
        const subtask = this.addInteractiveTask(params).start();
        try {
            await run(subtask);
            return true;
        } catch {
            return false;
        }
    }

    public async instrumentPostHogEvent(_event: PosthogEvent): Promise<void> {
        // no-op for now
    }
}
