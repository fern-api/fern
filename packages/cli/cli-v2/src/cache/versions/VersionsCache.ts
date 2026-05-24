import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import fs from "fs/promises";

/**
 * Cache for CLI binaries installed via `fern update`.
 *
 * Stores each version's binary at:
 * ```
 * ~/.cache/fern/v1/versions/<version>/<binaryName>
 * ```
 * where `<binaryName>` is `fern` on macOS/Linux and `fern.exe` on Windows.
 */
export declare namespace VersionsCache {
    /** Statistics for the versions cache. */
    interface Stats {
        /** Number of versions installed locally. */
        entryCount: number;
        /** Total size in bytes across all installed versions. */
        totalSize: number;
        /** Breakdown by version. */
        byVersion: Record<string, VersionStats>;
    }

    interface VersionStats {
        /** Size in bytes of this version's binary (and surrounding files). */
        totalSize: number;
    }

    interface ClearResult {
        /** Number of versions that were (or would be) deleted. */
        deletedCount: number;
        /** Total size that was (or would be) freed in bytes. */
        freedSize: number;
    }
}

export class VersionsCache {
    /** Absolute path to the versions cache root (e.g. ~/.cache/fern/v1/versions). */
    public readonly absoluteFilePath: AbsoluteFilePath;

    constructor({ absoluteFilePath }: { absoluteFilePath: AbsoluteFilePath }) {
        this.absoluteFilePath = absoluteFilePath;
    }

    /**
     * Get the directory that holds a given version's binary.
     */
    public getVersionPath(version: string): AbsoluteFilePath {
        return join(this.absoluteFilePath, RelativeFilePath.of(version));
    }

    /**
     * Get the absolute path to a specific version's binary file.
     */
    public getBinaryPath(version: string, binaryName: string): AbsoluteFilePath {
        return join(this.getVersionPath(version), RelativeFilePath.of(binaryName));
    }

    /**
     * Whether a binary file already exists on disk for this version.
     */
    public async hasVersion(version: string, binaryName: string): Promise<boolean> {
        return doesPathExist(this.getBinaryPath(version, binaryName));
    }

    /**
     * Discover versions present in the cache directory.
     */
    public async listLocalVersions(): Promise<string[]> {
        try {
            const entries = await fs.readdir(this.absoluteFilePath, { withFileTypes: true });
            return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
        } catch {
            return [];
        }
    }

    /**
     * Get statistics about the versions cache.
     */
    public async getStats(): Promise<VersionsCache.Stats> {
        const byVersion: Record<string, VersionsCache.VersionStats> = {};
        let totalSize = 0;
        let entryCount = 0;

        const versions = await this.listLocalVersions();
        for (const version of versions) {
            const versionPath = this.getVersionPath(version);
            const versionSize = await this.directorySize(versionPath);
            byVersion[version] = { totalSize: versionSize };
            totalSize += versionSize;
            entryCount += 1;
        }

        return { entryCount, totalSize, byVersion };
    }

    /**
     * Delete a single version directory from the cache.
     */
    public async removeVersion(version: string, dryRun: boolean): Promise<VersionsCache.ClearResult> {
        const versionPath = this.getVersionPath(version);
        const size = await this.directorySize(versionPath);
        if (size === 0 && !(await doesPathExist(versionPath))) {
            return { deletedCount: 0, freedSize: 0 };
        }
        if (!dryRun) {
            await fs.rm(versionPath, { recursive: true, force: true });
        }
        return { deletedCount: 1, freedSize: size };
    }

    /**
     * Clear all installed versions.
     */
    public async clear(dryRun: boolean): Promise<VersionsCache.ClearResult> {
        let deletedCount = 0;
        let freedSize = 0;

        const versions = await this.listLocalVersions();
        for (const version of versions) {
            const result = await this.removeVersion(version, dryRun);
            deletedCount += result.deletedCount;
            freedSize += result.freedSize;
        }

        return { deletedCount, freedSize };
    }

    private async directorySize(path: AbsoluteFilePath): Promise<number> {
        let total = 0;
        try {
            const entries = await fs.readdir(path, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = join(path, RelativeFilePath.of(entry.name));
                if (entry.isDirectory()) {
                    total += await this.directorySize(entryPath);
                } else if (entry.isFile()) {
                    try {
                        const stat = await fs.stat(entryPath);
                        total += stat.size;
                    } catch {
                        // Ignore stat errors.
                    }
                }
            }
        } catch {
            // Directory doesn't exist or isn't readable.
        }
        return total;
    }
}
