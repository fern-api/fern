import { LogLevel } from "./LogLevel";

export interface Logger {
    debug: (...args: string[]) => void;
    info: (...args: string[]) => void;
    warn: (...args: string[]) => void;
    error: (...args: string[]) => void;
    log: (level: LogLevel, ...args: string[]) => void;
}
