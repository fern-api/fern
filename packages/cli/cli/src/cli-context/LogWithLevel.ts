import { LogLevel } from "@fern-api/logger";

export interface LogWithLevel {
    content: string;
    level: LogLevel;
}
