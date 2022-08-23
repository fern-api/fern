import { LogLevel } from "./LogLevel";

export interface Logger {
    debug: (value: string) => void;
    info: (value: string) => void;
    warn: (value: string) => void;
    error: (value: string) => void;
    log: (value: string, level: LogLevel) => void;
}
