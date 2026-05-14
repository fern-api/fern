import {
    AbsoluteFilePath,
    dirname,
    doesPathExist,
    join,
    RelativeFilePath,
    streamObjectToFile
} from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import crypto from "crypto";
import fs from "fs/promises";
import { formatBytes } from "../../ui/format.js";

/**
 * Content-addressable cache for IR files.
 *
 * Stores IR files organized by version and content hash:
 * ```
 * ~/.cache/fern/v1/ir/
 * ├── v63/
 * │   └── sha256/
 * │       ├── 0a/
 * │       │   └── 0a3f9c2e4a7d1b...json
 * │       └── ff/
 * │           └── ff02a1d998c11d...json
 * └── v62/
 *     └── sha256/...
 * ```
 */
export declare namespace IrCache {
    /** A cached IR entry */
    interface Entry {
        /** SHA-256 hash of the content */
        hash: string;
        /** IR version (e.g., "v63", "v62") */
        irVersion: string;
        /** Full path to the cached file */
        absoluteFilePath: AbsoluteFilePath;
        /** Size in bytes */
        size: number;
        /** Timestamp when the entry was created */
        createdAt: Date;
    }

    /** Statistics for the IR cache */
    interface Stats {
        /** Total number of cached IR entries */
        entryCount: number;
        /** Total size in bytes */
        totalSize: number;
        /** Breakdown by IR version */
        byVersion: Record<string, VersionStats>;
    }

    /** Statistics for a specific IR version */
    interface VersionStats {
        /** Number of entries for this version */
        entryCount: number;
        /** Total size in bytes for this version */
        totalSize: number;
    }

    interface ClearResult {
        /** Number of entries that were (or would be) deleted */
        deletedCount: number;
        /** Total size that was (or would be) freed in bytes */
        freedSize: number;
    }
}

export class IrCache {
    /** Absolute file path to the IR cache directory (e.g. ~/.cache/fern/v1/ir) */
    public readonly absoluteFilePath: AbsoluteFilePath;

    private readonly tempPath: AbsoluteFilePath;
    private readonly logger: Logger | undefined;

    constructor({
        absoluteFilePath,
        tempPath,
        logger
    }: {
        absoluteFilePath: AbsoluteFilePath;
        tempPath: AbsoluteFilePath;
        logger?: Logger;
    }) {
        this.absoluteFilePath = absoluteFilePath;
        this.tempPath = tempPath;
        this.logger = logger;
    }

    /**
     * Get the path for a specific IR version directory.
     */
    public getVersionPath(irVersion: string): AbsoluteFilePath {
        return join(this.absoluteFilePath, RelativeFilePath.of(irVersion));
    }

    /**
     * Get the path for a specific IR cache entry.
     */
    public getEntryPath({ irVersion, hash }: { irVersion: string; hash: string }): AbsoluteFilePath {
        const prefix = hash.substring(0, 2);
        return join(
            this.getVersionPath(irVersion),
            RelativeFilePath.of("sha256"),
            RelativeFilePath.of(prefix),
            RelativeFilePath.of(`${hash}.json`)
        );
    }

    /**
     * Look up a cached IR entry by hash and version.
     */
    public async lookup({ hash, irVersion }: { hash: string; irVersion: string }): Promise<IrCache.Entry | undefined> {
        const entryPath = this.getEntryPath({ irVersion, hash });
        try {
            const stats = await fs.stat(entryPath);
            if (!stats.isFile()) {
                return undefined;
            }
            const entry: IrCache.Entry = {
                hash,
                irVersion,
                absoluteFilePath: entryPath,
                size: stats.size,
                createdAt: stats.birthtime
            };
            this.logger?.debug(`Cache hit: ${irVersion}/${hash.substring(0, 8)}... (${formatBytes(stats.size)})`);
            return entry;
        } catch {
            // File doesn't exist or isn't accessible.
            return undefined;
        }
    }

    /**
     * Read the content of a cached IR entry.
     */
    public async read(entry: IrCache.Entry): Promise<string> {
        return await fs.readFile(entry.absoluteFilePath, "utf-8");
    }

    /**
     * Store IR content in the cache with an atomic write.
     *
     * Streams the object to JSON on disk without building the full string
     * in memory (IR files can be 50MB+).
     */
    public async store({
        hash,
        irVersion,
        content
    }: {
        hash: string;
        irVersion: string;
        content: unknown;
    }): Promise<IrCache.Entry> {
        const entryPath = this.getEntryPath({ irVersion, hash });
        const entryDir = dirname(entryPath);
        const tempFile = join(this.tempPath, RelativeFilePath.of(`${crypto.randomUUID()}.json`));

        // Create the directory structure if it doesn't exist.
        await fs.mkdir(entryDir, { recursive: true });
        await fs.mkdir(this.tempPath, { recursive: true });

        try {
            await streamObjectToFile(tempFile, content, { pretty: true });
            await fs.rename(tempFile, entryPath);
        } catch (error) {
            // Clean up temp file if rename fails.
            try {
                await fs.unlink(tempFile);
            } catch {
                // Ignore cleanup errors.
            }
            throw error;
        }

        const stats = await fs.stat(entryPath);
        return {
            hash,
            irVersion,
            absoluteFilePath: entryPath,
            size: stats.size,
            createdAt: stats.birthtime
        };
    }

    /**
     * Clear all IR cache entries.
     */
    public async clear(options?: { dryRun?: boolean }): Promise<IrCache.ClearResult> {
        if (!(await doesPathExist(this.absoluteFilePath))) {
            return { deletedCount: 0, freedSize: 0 };
        }

        const dryRun = options?.dryRun ?? false;

        let deletedCount = 0;
        let freedSize = 0;

        const versions = await this.listVersionDirectories();
        for (const version of versions) {
            const versionPath = this.getVersionPath(version);
            const result = await this.clearDirectory(versionPath, dryRun);
            deletedCount += result.deletedCount;
            freedSize += result.freedSize;
        }

        return { deletedCount, freedSize };
    }

    /**
     * Get statistics about the IR cache.
     */
    public async getStats(): Promise<IrCache.Stats> {
        const byVersion: Record<string, IrCache.VersionStats> = {};

        if (!(await doesPathExist(this.absoluteFilePath))) {
            return { entryCount: 0, totalSize: 0, byVersion };
        }

        let entryCount = 0;
        let totalSize = 0;

        const versions = await this.listVersionDirectories();
        for (const version of versions) {
            const versionPath = this.getVersionPath(version);
            const stats = await this.getDirectoryStats(versionPath);
            byVersion[version] = stats;
            entryCount += stats.entryCount;
            totalSize += stats.totalSize;
        }

        return { entryCount, totalSize, byVersion };
    }

    /**
     * List all IR version directories.
     */
    private async listVersionDirectories(): Promise<string[]> {
        try {
            const entries = await fs.readdir(this.absoluteFilePath, { withFileTypes: true });
            return entries.filter((e) => e.isDirectory()).map((e) => e.name);
        } catch {
            return [];
        }
    }

    /**
     * Get statistics for a directory.
     */
    private async getDirectoryStats(dirPath: AbsoluteFilePath): Promise<IrCache.VersionStats> {
        let entryCount = 0;
        let totalSize = 0;

        const walk = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = `${dir}/${entry.name}`;
                    if (entry.isDirectory()) {
                        await walk(fullPath);
                        continue;
                    }
                    if (entry.isFile() && entry.name.endsWith(".json")) {
                        entryCount++;
                        try {
                            const stats = await fs.stat(fullPath);
                            totalSize += stats.size;
                        } catch {
                            // Ignore stat errors.
                        }
                    }
                }
            } catch {
                // Ignore read errors.
            }
        };

        await walk(dirPath);

        return { entryCount, totalSize };
    }

    /**
     * Clear a directory and return statistics.
     */
    private async clearDirectory(
        dirPath: AbsoluteFilePath,
        dryRun: boolean
    ): Promise<{ deletedCount: number; freedSize: number }> {
        if (!(await doesPathExist(dirPath))) {
            return { deletedCount: 0, freedSize: 0 };
        }

        let deletedCount = 0;
        let freedSize = 0;

        const walk = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = `${dir}/${entry.name}`;
                    if (entry.isDirectory()) {
                        await walk(fullPath);
                        // Remove empty directories (unless dry run).
                        if (!dryRun) {
                            try {
                                await fs.rmdir(fullPath);
                            } catch {
                                // Directory not empty or other error.
                            }
                        }
                        continue;
                    }
                    if (entry.isFile() && entry.name.endsWith(".json")) {
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
                // Ignore read errors.
            }
        };

        await walk(dirPath);

        // Try to remove the version directory itself.
        if (!dryRun) {
            try {
                await fs.rmdir(dirPath);
            } catch {
                // Directory not empty or other error.
            }
        }

        return { deletedCount, freedSize };
    }
}
