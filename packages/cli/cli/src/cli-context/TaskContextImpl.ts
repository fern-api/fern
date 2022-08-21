import { Logger, LogLevel } from "@fern-api/logger";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import stripAnsi from "strip-ansi";
import { LogWithLevel } from "./LogWithLevel";

export declare namespace TaskContextImpl {
    export interface Init {
        log: (content: string) => void;
        logPrefix?: string;
    }
}

export class TaskContextImpl implements TaskContext {
    protected result = TaskResult.Success;
    protected log: (content: string) => void;
    protected logPrefix: string;
    private logs: LogWithLevel[] = [];

    public constructor({ log, logPrefix }: TaskContextImpl.Init) {
        this.log = log;
        this.logPrefix = logPrefix ?? "";
    }

    public fail(): void {
        this.result = TaskResult.Failure;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public printLogs(): void {
        const prefixLength = stripAnsi(this.logPrefix).length;
        const str = this.logs
            .map((log) => {
                return {
                    content: `${this.logPrefix}${log.content.replaceAll("\n", `\n${" ".repeat(prefixLength)}`)}`,
                    level: log.level,
                };
            })
            .map((log) => log.content)
            .join("\n");
        this.log(str);
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
