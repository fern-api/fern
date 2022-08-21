import { Logger, LogLevel } from "@fern-api/logger";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import { LogWithLevel } from "./LogWithLevel";

export class TaskContextImpl implements TaskContext {
    protected result = TaskResult.Success;

    public fail(): void {
        this.result = TaskResult.Failure;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    private logs: LogWithLevel[] = [];
    public getLogs(): LogWithLevel[] {
        return this.logs;
    }

    private addLog(content: string, level: LogLevel): void {
        this.logs.push({ content, level });
    }

    public get logger(): Logger {
        return {
            debug: (content) => {
                this.addLog(content, LogLevel.Debug);
            },
            info: (content) => {
                this.addLog(content, LogLevel.Info);
            },
            warn: (content) => {
                this.addLog(content, LogLevel.Warn);
            },
            error: (content) => {
                this.addLog(content, LogLevel.Error);
            },
            log: (content, level) => {
                this.addLog(content, level);
            },
        };
    }
}
