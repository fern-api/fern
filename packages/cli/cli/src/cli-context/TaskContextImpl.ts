import { Logger, LogLevel, TaskContext } from "@fern-api/task-context";
import { InteractiveTaskContextImpl } from "./InteractiveTaskContextImpl";
import { LogWithLevel } from "./LogWithLevel";

export type Subtask =
    | { isInteractive: false; task: TaskContextImpl }
    | { isInteractive: true; task: InteractiveTaskContextImpl };

export class TaskContextImpl implements TaskContext {
    private logs: LogWithLevel[] = [];
    public getLogs(): LogWithLevel[] {
        return this.logs;
    }

    private addLog(content: string, level: LogLevel): void {
        this.logs.push({ content, level });
    }

    get logger(): Logger {
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
