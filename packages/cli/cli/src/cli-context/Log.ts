import { LogLevel } from "@fern-api/logger";

export interface Log {
    content: string;
    level: LogLevel;
    /**
     * @default false
     */
    omitOnTTY?: boolean;
}
