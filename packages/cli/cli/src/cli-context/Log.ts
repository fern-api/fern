import { LogLevel } from "@fern-api/logger";

export interface Log {
    level: LogLevel;
    args: unknown[];
    prefix?: string;
    omitOnTTY?: boolean;
}
