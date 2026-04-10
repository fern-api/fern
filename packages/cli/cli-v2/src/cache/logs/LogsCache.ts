import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import fs from "fs/promises";

/**
 * Provides access to the logs directory within the cache.
 */
export declare namespace LogsCache {
    /** Statistics for the logs directory */
    interface Stats {
        /** Number of log files */
        fileCount: number;
        /** Total size in bytes */
        totalSize: number;
    }

    interface ClearResult {
        /** Number of log files that were (or would be) deleted */
        deletedCount: number;
        /** Total size that was (or would be) freed in bytes */
        freedSize: number;
    }
}

export class LogsCache {
    /** Absolute file path to the log cache directory (e.g. ~/.cache/fern/v1/logs) */
    public readonly absoluteFilePath: AbsoluteFilePath;

    constructor({ absoluteFilePath }: { absoluteFilePath: AbsoluteFilePath }) {
        this.absoluteFilePath = absoluteFilePath;
    }

    /**
     * Get statistics about the logs cache.
     */
    public async getStats(): Promise<LogsCache.Stats> {
        let fileCount = 0;
        let totalSize = 0;

        try {
            const entries = await fs.readdir(this.absoluteFilePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith(".log")) {
                    fileCount++;
                    try {
                        const stats = await fs.stat(`${this.absoluteFilePath}/${entry.name}`);
                        totalSize += stats.size;
                    } catch {
                        // Ignore stat errors.
                    }
                }
            }
        } catch {
            // Directory doesn't exist or isn't readable.
        }

        return { fileCount, totalSize };
    }

    /**
     * Clear log files from the cache.
     */
    public async clear(dryRun: boolean): Promise<LogsCache.ClearResult> {
        let deletedCount = 0;
        let freedSize = 0;

        try {
            const entries = await fs.readdir(this.absoluteFilePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith(".log")) {
                    const fullPath = `${this.absoluteFilePath}/${entry.name}`;
                    try {
                        const stats = await fs.stat(fullPath);
                        deletedCount++;
                        freedSize += stats.size;
                        if (!dryRun) {
                            await fs.unlink(fullPath);
                        }
                    } catch {
                        // Ignore errors.
                    }
                }
            }
        } catch {
            // Directory doesn't exist or isn't readable.
        }

        return { deletedCount, freedSize };
    }
}
