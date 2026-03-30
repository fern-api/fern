import { appendFileSync, writeFileSync } from "fs";

export interface PerformanceLogger {
    start(id: string, phase: string): void;
    end(id: string, phase: string, ms: number): void;
    getFilePath(): string | undefined;
}

interface ProfileEvent {
    id: string;
    phase: string;
    event: "start" | "end";
    ms?: number;
    ts: number;
}

export class FilePerformanceLogger implements PerformanceLogger {
    private readonly filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        // Initialize the file (truncate if exists)
        writeFileSync(this.filePath, "");
    }

    public start(id: string, phase: string): void {
        this.write({ id, phase, event: "start", ts: Date.now() });
    }

    public end(id: string, phase: string, ms: number): void {
        this.write({ id, phase, event: "end", ms, ts: Date.now() });
    }

    public getFilePath(): string {
        return this.filePath;
    }

    private write(event: ProfileEvent): void {
        // appendFileSync is atomic for strings under ~8KB on POSIX,
        // safe for concurrent writes from parallel fixtures
        appendFileSync(this.filePath, JSON.stringify(event) + "\n");
    }
}

export class NoOpPerformanceLogger implements PerformanceLogger {
    public start(): void {}
    public end(): void {}
    public getFilePath(): string | undefined {
        return undefined;
    }
}
