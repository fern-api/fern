import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import os from "os";
import { FernRcSchemaLoader } from "../config/fern-rc/FernRcSchemaLoader.js";
import { IrCache } from "./ir/index.js";
import { LogsCache } from "./logs/index.js";

const CACHE_VERSION = "v1";

/**
 * CLI cache providing access to all cache subsystems.
 *
 * Directory structure:
 * ```
 * ~/.cache/fern               # Linux and macOS (XDG_CACHE_HOME/fern)
 * %LOCALAPPDATA%/fern/cache   # Windows
 *
 * ├── v1/                     # Cache schema version
 * │   ├── ir/
 * │   │   ├── v63/
 * │   │   │   └── sha256/
 * │   │   │       └── 0a/
 * │   │   │           └── 0a3f9c2e4a7d1b...json
 * │   │   └── v62/
 * │   └── logs/
 * └── tmp/                    # Atomic write staging
 * ```
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
    }

    /** Options for clearing cache entries */
    interface ClearOptions {
        /** Clear IR cache entries */
        ir?: boolean;
        /** Clear log files */
        logs?: boolean;
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

    /** Directory for downloaded generator migration packages. */
    public readonly migrations: { absoluteFilePath: AbsoluteFilePath };

    constructor({ logger }: { logger?: Logger } = {}) {
        this.absoluteFilePath = this.resolveAbsoluteFilePath();
        this.ir = new IrCache({
            absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("ir")),
            tempPath: this.getTempPath(),
            logger
        });
        this.logs = new LogsCache({ absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("logs")) });
        this.migrations = {
            absoluteFilePath: join(this.getVersionedPath(), RelativeFilePath.of("migrations"))
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

        return {
            totalSize: irStats.totalSize + logsStats.totalSize,
            ir: irStats,
            logs: logsStats
        };
    }

    /**
     * Clear cache entries. If no specific subsystem is specified, clears everything.
     */
    public async clear(options?: Cache.ClearOptions): Promise<Cache.ClearResult> {
        const dryRun = options?.dryRun ?? false;

        let deletedCount = 0;
        let freedSize = 0;

        const clearIr = options?.ir ?? options?.logs == null;
        if (clearIr) {
            const irResult = await this.ir.clear({ dryRun });
            deletedCount += irResult.deletedCount;
            freedSize += irResult.freedSize;
        }

        const clearLogs = options?.logs ?? options?.ir == null;
        if (clearLogs) {
            const logsResult = await this.logs.clear(dryRun);
            deletedCount += logsResult.deletedCount;
            freedSize += logsResult.freedSize;
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
     *  3. Platform defaults (XDG on macOS/Linux, LOCALAPPDATA on Windows)
     */
    private resolveAbsoluteFilePath(): AbsoluteFilePath {
        const envCacheDir = process.env.FERN_CACHE_DIR;
        if (envCacheDir != null && envCacheDir.length > 0) {
            return AbsoluteFilePath.of(this.expandPath(envCacheDir));
        }

        const fernRcCachePath = new FernRcSchemaLoader().loadCachePathSync();
        if (fernRcCachePath != null && fernRcCachePath.length > 0) {
            return AbsoluteFilePath.of(this.expandPath(fernRcCachePath));
        }

        const homeDir = AbsoluteFilePath.of(os.homedir());

        const platform = process.platform;
        if (platform === "win32") {
            // Windows: %LOCALAPPDATA%/fern/cache
            const localAppData =
                process.env.LOCALAPPDATA != null
                    ? AbsoluteFilePath.of(process.env.LOCALAPPDATA)
                    : join(homeDir, RelativeFilePath.of("AppData/Local"));
            return join(localAppData, RelativeFilePath.of("fern/cache"));
        }

        // For macOS and Linux, follow the XDG Base Directory Specification.
        // For details, see: https://specifications.freedesktop.org/basedir/latest
        const xdgCacheHome =
            process.env.XDG_CACHE_HOME != null
                ? AbsoluteFilePath.of(process.env.XDG_CACHE_HOME)
                : join(homeDir, RelativeFilePath.of(".cache"));
        return join(xdgCacheHome, RelativeFilePath.of("fern"));
    }

    /**
     * Expand `~` prefix to the user's home directory.
     */
    private expandPath(path: string): string {
        if (path.startsWith("~/") || path === "~") {
            return path.replace("~", os.homedir());
        }
        return path;
    }
}
