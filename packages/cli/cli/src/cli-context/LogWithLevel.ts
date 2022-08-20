import { LogLevel } from "@fern-api/task-context";

export interface LogWithLevel {
    content: string;
    level: LogLevel;
}
