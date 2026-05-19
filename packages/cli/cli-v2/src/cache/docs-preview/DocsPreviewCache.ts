import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import fs from "fs/promises";
import path from "path";

/**
 * Provides access to the docs-preview directory within the cache.
 *
 * This includes both the app-preview (Next.js) and legacy preview
 * bundles downloaded for `fern docs dev`.
 */
export declare namespace DocsPreviewCache {
    /** Statistics for the docs preview cache */
    interface Stats {
        /** Number of preview bundle directories */
        bundleCount: number;
        /** Total size in bytes */
        totalSize: number;
    }

    interface ClearResult {
        /** Number of entries that were (or would be) deleted */
        deletedCount: number;
        /** Total size that was (or would be) freed in bytes */
        freedSize: number;
    }
}

export class DocsPreviewCache {
    /** Absolute file path to the docs-preview cache directory */
    public readonly absoluteFilePath: AbsoluteFilePath;

    constructor({ absoluteFilePath }: { absoluteFilePath: AbsoluteFilePath }) {
        this.absoluteFilePath = absoluteFilePath;
    }

    /**
     * Get statistics about the docs preview cache.
     */
    public async getStats(): Promise<DocsPreviewCache.Stats> {
        let bundleCount = 0;
        let totalSize = 0;

        try {
            const entries = await fs.readdir(this.absoluteFilePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    bundleCount++;
                    totalSize += await this.getDirectorySize(path.join(this.absoluteFilePath, entry.name));
                }
            }
        } catch {
            // Directory doesn't exist or isn't readable.
        }

        return { bundleCount, totalSize };
    }

    /**
     * Clear docs preview cache entries.
     */
    public async clear(dryRun: boolean): Promise<DocsPreviewCache.ClearResult> {
        let deletedCount = 0;
        let freedSize = 0;

        try {
            const entries = await fs.readdir(this.absoluteFilePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const fullPath = path.join(this.absoluteFilePath, entry.name);
                    const size = await this.getDirectorySize(fullPath);
                    deletedCount++;
                    freedSize += size;
                    if (!dryRun) {
                        await fs.rm(fullPath, { recursive: true, force: true });
                    }
                }
            }
        } catch {
            // Directory doesn't exist or isn't readable.
        }

        return { deletedCount, freedSize };
    }

    private async getDirectorySize(dirPath: string): Promise<number> {
        let totalSize = 0;
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = path.join(dirPath, entry.name);
                if (entry.isFile() || entry.isSymbolicLink()) {
                    try {
                        const stats = await fs.stat(entryPath);
                        totalSize += stats.size;
                    } catch {
                        // Ignore stat errors.
                    }
                } else if (entry.isDirectory()) {
                    totalSize += await this.getDirectorySize(entryPath);
                }
            }
        } catch {
            // Ignore readdir errors.
        }
        return totalSize;
    }
}
