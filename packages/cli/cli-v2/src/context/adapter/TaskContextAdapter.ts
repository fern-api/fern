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
import type { Context } from "../Context";
import { TaskContextLogger } from "./TaskContextLogger";

/**
 * Adapts the cli-v2 Context to the v1 TaskContext interface.
 *
 * This allows v2 commands to use v1 infrastructure that requires TaskContext,
 * such as IR generation.
 */
export class TaskContextAdapter implements TaskContext {
    private context: Context;
    private result: TaskResult = TaskResult.Success;
    private errorMessage: string | undefined;

    public readonly logger: Logger;

    constructor({ context, badge }: { context: Context; badge?: string }) {
        this.context = context;
        this.logger = new TaskContextLogger({ logger: this.context.stderr, logLevel: this.context.logLevel, badge });
    }

    /**
     * Get the first error message collected during execution.
     */
    public getErrorMessage(): string | undefined {
        return this.errorMessage;
    }

    public async takeOverTerminal(run: () => void | Promise<void>): Promise<void> {
        await run();
    }

    public failAndThrow(message?: string, error?: unknown): never {
        this.failWithoutThrowing(message, error);
        throw new FernCliError();
    }

    public failWithoutThrowing(message?: string, error?: unknown): void {
        // Store the first error message for later retrieval
        if (this.errorMessage == null) {
            if (message != null) {
                this.errorMessage = message;
            } else if (error != null) {
                this.errorMessage = error instanceof Error ? error.message : String(error);
            }
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
