import { LogLevel } from "@fern-api/logger";

export interface Log {
    content: string;
    /**
     * @default false
     */
    omitOnTTY?: boolean;
}

export interface LogWithLevel extends Log {
    level: LogLevel;
}
