import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import os from "os";
import { FernRcSchemaLoader } from "../config/fern-rc/FernRcSchemaLoader.js";
import { DocsPreviewCache } from "./docs-preview/index.js";
import { IrCache } from "./ir/index.js";
import { LogsCache } from "./logs/index.js";

const CACHE_VERSION = "v1";

/**
 * CLI cache providing access to all cache subsystems.
 *
 * Directory structure:
 * ```
 * ~/.fern/                     # Cache root (all platforms)
 * ├── bin/                     # Downloaded tool binaries (buf, protoc-gen-openapi)
 * ├── token                    # Auth token (NOT managed by cache — never cleared)
 * ├── id                       # Telemetry distinct ID (NOT managed by cache)
 * ├── v1/                      # Cache schema version
 * │   ├── ir/
 * │   │   ├── v63/
 * │   │   │   └── sha256/
 * │   │   │       └── 0a/
 * │   │   │           └── 0a3f9c2e4a7d1b...json
 * │   │   └── v62/
 * │   ├── logs/
 * │   ├── migrations/
 * │   └── docs-preview/
 * │       ├── app-preview/      # Next.js docs bundle
 * │       └── preview/          # Legacy docs bundle
 * └── tmp/                     # Atomic write staging
 * ```
 *
 * Files at the root level (token, id) are NOT cache entries and are never
 * touched by {@link Cache.clear}. Only versioned subdirectories are managed.
 */
export declare namespace Cache {
    /** Combined statistics for the entire cache */
    interface Stats {
        /** Total size in bytes across all cache types */
        totalSize: number;
        /** IR cache statistics */
        ir: IrCache.Stats;
        /** Logs statistics */
        logs: LogsCache.Stats;
        /** Docs preview cache statistics */
        docsPreview: DocsPreviewCache.Stats;
    }

    /** Options for clearing cache entries */
    interface ClearOptions {
        /** Clear IR cache entries */
        ir?: boolean;
        /** Clear log files */
        logs?: boolean;
        /** Clear docs preview bundles */
        docsPreview?: boolean;
        /** Preview what would be cleared without actually deleting */
        dryRun?: boolean;
    }

    /** Result of a cache clear operation */
    interface ClearResult {
        /** Number of entries that were (or would be) deleted */
        deletedCount: number;
        /** Total size that was (or would be) freed in bytes */
        freedSize: number;
        /** Whether this was a dry run */
        dryRun: boolean;
    }
}

export class Cache {
    public readonly absoluteFilePath: AbsoluteFilePath;
    public readonly ir: IrCache;
    public readonly logs: LogsCache;
    public readonly docsPreview: DocsPreviewCache;

    /** Directory for downloaded generator migration packages. */
    public readonly migrations: { absoluteFilePath: AbsoluteFilePath };

    /** Directory for downloaded tool binaries (buf, protoc-gen-openapi). Shared with CLI v1. */
    public readonly bin: { absoluteFilePath: AbsoluteFilePath };

    constructor({ logger }: { logger?: Logger } = {}) {
        this.absoluteFilePath = Cache.resolveAbsoluteFilePathStatic();
        this.ir = new IrCache({
            absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("ir")),
            tempPath: this.getTempPath(),
            logger
        });
        this.logs = new LogsCache({ absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("logs")) });
        this.docsPreview = new DocsPreviewCache({
            absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("docs-preview"))
        });
        this.migrations = {
            absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("migrations"))
        };
        this.bin = {
            absoluteFilePath: join(this.absoluteFilePath, RelativeFilePath.of("bin"))
        };
    }

    /**
     * Get the versioned cache directory path.
     * This includes the cache schema version prefix.
     */
    public getVersionedPath(): AbsoluteFilePath {
        return join(this.absoluteFilePath, RelativeFilePath.of(CACHE_VERSION));
    }

    /**
     * Get the temporary directory for atomic writes.
     */
    public getTempPath(): AbsoluteFilePath {
        return join(this.absoluteFilePath, RelativeFilePath.of("tmp"));
    }

    /**
     * Get statistics for the entire cache.
     */
    public async getStats(): Promise<Cache.Stats> {
        const irStats = await this.ir.getStats();
        const logsStats = await this.logs.getStats();
        const docsPreviewStats = await this.docsPreview.getStats();

        return {
            totalSize: irStats.totalSize + logsStats.totalSize + docsPreviewStats.totalSize,
            ir: irStats,
            logs: logsStats,
            docsPreview: docsPreviewStats
        };
    }

    /**
     * Clear cache entries. If no specific subsystem is specified, clears everything.
     */
    public async clear(options?: Cache.ClearOptions): Promise<Cache.ClearResult> {
        const dryRun = options?.dryRun ?? false;

        let deletedCount = 0;
        let freedSize = 0;

        const hasSpecificFilter = options?.ir != null || options?.logs != null || options?.docsPreview != null;

        const clearIr = options?.ir ?? !hasSpecificFilter;
        if (clearIr) {
            const irResult = await this.ir.clear({ dryRun });
            deletedCount += irResult.deletedCount;
            freedSize += irResult.freedSize;
        }

        const clearLogs = options?.logs ?? !hasSpecificFilter;
        if (clearLogs) {
            const logsResult = await this.logs.clear(dryRun);
            deletedCount += logsResult.deletedCount;
            freedSize += logsResult.freedSize;
        }

        const clearDocsPreview = options?.docsPreview ?? !hasSpecificFilter;
        if (clearDocsPreview) {
            const docsPreviewResult = await this.docsPreview.clear(dryRun);
            deletedCount += docsPreviewResult.deletedCount;
            freedSize += docsPreviewResult.freedSize;
        }

        return { deletedCount, freedSize, dryRun };
    }

    /**
     * Resolve the absolute file path for the cache directory based on environment,
     * ~/.fernrc configuration, and platform defaults.
     *
     * Priority order:
     *  1. FERN_CACHE_DIR environment variable
     *  2. The configured cache path in ~/.fernrc
     *  3. Default: ~/.fern/
     */
    private static resolveAbsoluteFilePathStatic(): AbsoluteFilePath {
        const envCacheDir = process.env.FERN_CACHE_DIR;
        if (envCacheDir != null && envCacheDir.length > 0) {
            return AbsoluteFilePath.of(Cache.expandPath(envCacheDir));
        }

        const fernRcCachePath = new FernRcSchemaLoader().loadCachePathSync();
        if (fernRcCachePath != null && fernRcCachePath.length > 0) {
            return AbsoluteFilePath.of(Cache.expandPath(fernRcCachePath));
        }

        return join(AbsoluteFilePath.of(os.homedir()), RelativeFilePath.of(".fern"));
    }

    /**
     * Expand `~` prefix to the user's home directory.
     */
    private static expandPath(path: string): string {
        if (path.startsWith("~/") || path === "~") {
            return path.replace("~", os.homedir());
        }
        return path;
    }
}
