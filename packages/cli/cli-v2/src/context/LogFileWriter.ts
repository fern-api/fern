import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { appendFileSync, mkdirSync, writeFileSync } from "fs";

/**
 * Writes logs to a file for later inspection.
 */
export class LogFileWriter {
    public readonly absoluteFilePath: AbsoluteFilePath;
    private initialized = false;

    constructor(logsDirectory: AbsoluteFilePath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        this.absoluteFilePath = join(logsDirectory, RelativeFilePath.of(`${timestamp}.log`));
    }

    /**
     * Write a log entry to the file.
     */
    public write({ taskName, level, message }: { taskName: string; level: LogLevel; message: string }): void {
        this.ensureInitialized();
        const timestamp = new Date().toISOString();
        const line = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] [${taskName}] ${message}\n`;
        appendFileSync(this.absoluteFilePath, line);
    }

    /**
     * Returns true if the log file is empty.
     */
    public empty(): boolean {
        return !this.initialized;
    }

    private ensureInitialized(): void {
        if (this.initialized) {
            return;
        }
        // Create the logs directory and file.
        mkdirSync(dirname(this.absoluteFilePath), { recursive: true });
        writeFileSync(this.absoluteFilePath, `Fern Debug Log - ${new Date().toISOString()}\n${"=".repeat(60)}\n\n`);
        this.initialized = true;
    }
}
