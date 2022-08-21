export interface Logger {
    debug: (value: string) => void;
    info: (value: string) => void;
    warn: (value: string) => void;
    error: (value: string) => void;
    log: (value: string, level: LogLevel) => void;
}

export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}
