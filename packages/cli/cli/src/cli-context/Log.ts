import { LogLevel } from "@fern-api/logger";

export interface Log {
    level: LogLevel;
    parts: unknown[];
    prefix?: string;
    omitOnTTY?: boolean;
    time: Date;
}
