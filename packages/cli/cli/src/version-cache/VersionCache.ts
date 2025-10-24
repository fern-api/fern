import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { FERN_CWD_ENV_VAR } from "../cwd";
import {
    CACHE_METADATA_SCHEMA_VERSION,
    CACHE_SIZE_ENV_VAR,
    DEFAULT_DOWNLOAD_TIMEOUT_MS,
    DEFAULT_FERN_VERSION_CACHE_SIZE,
    DISABLE_CACHE_ENV_VAR,
    MAX_VERSION_SIZE_BYTES
} from "./constants";
import {
    CacheEntry,
    CacheExecutionResult,
    CacheMetadata,
    InternalVersionCacheOptions,
    VersionCacheOptions
} from "./types";
import {
    calculateDirectorySize,
    createTimestamp,
    findPackageExecutable,
    getCacheDirectory,
    getCacheKey,
    getCacheMetadataPath,
    getVersionCacheDirectory,
    isValidPackageName,
    isValidVersion
} from "./utils";

export class VersionCache {
    private readonly options: InternalVersionCacheOptions;
    private readonly logger: Logger;
    private cachedMetadata: CacheMetadata | null = null;

    constructor(logger: Logger, inputOptions: VersionCacheOptions = {}) {
        this.logger = logger;

        // Transform input options to internal options with all properties required (saves us some checks later)
        this.options = {
            maxSize: this.parseMaxSizeFromEnv() ?? inputOptions.maxSize ?? DEFAULT_FERN_VERSION_CACHE_SIZE,
            cacheDirectory: inputOptions.cacheDirectory ?? getCacheDirectory(),
            disabled: this.isCacheDisabled() || inputOptions.disabled || false,
            downloadTimeoutMs: inputOptions.downloadTimeoutMs ?? DEFAULT_DOWNLOAD_TIMEOUT_MS
        };

        this.logger.debug(
            `Version cache initialized with maxSize=${this.options.maxSize}, disabled=${this.options.disabled}`
        );
    }

    /**
     * Check if a version is cached and return the cache entry if available
     */
    async getCachedVersion(packageName: string, version: string): Promise<CacheEntry | null> {
        if (this.options.disabled) {
            return null;
        }

        if (!isValidPackageName(packageName) || !isValidVersion(version)) {
            this.logger.debug(`Invalid package name or version: ${packageName}@${version}`);
            return null;
        }

        try {
            const metadata = await this.loadMetadata();
            const cacheKey = getCacheKey(packageName, version);

            const entry = metadata.entries.find((e) => e.key === cacheKey);
            if (!entry) {
                this.logger.debug(`Cache miss for ${cacheKey}`);
                return null;
            }

            // Verify the cached directory still exists
            if (!(await doesPathExist(entry.path))) {
                this.logger.debug(`Cache entry exists but directory missing: ${entry.path}`);
                await this.removeCacheEntry(cacheKey);
                return null;
            }

            // Update last used timestamp
            await this.updateLastUsed(entry);

            this.logger.debug(`Cache hit for ${cacheKey} at ${entry.path}`);
            return entry;
        } catch (error) {
            this.logger.debug(`Error checking cache for ${packageName}@${version}: ${String(error)}`);
            return null;
        }
    }

    /**
     * Download and cache a version if not already cached
     */
    async cacheVersion(packageName: string, version: string): Promise<CacheEntry> {
        if (!isValidPackageName(packageName) || !isValidVersion(version)) {
            throw new Error(`Invalid package name or version: ${packageName}@${version}`);
        }

        const cacheKey = getCacheKey(packageName, version);
        this.logger.debug(`Caching version ${cacheKey}`);

        const existingEntry = await this.getCachedVersion(packageName, version);
        if (existingEntry) {
            this.logger.debug(`Version ${cacheKey} already cached`);
            return existingEntry;
        }

        const versionDir = getVersionCacheDirectory(packageName, version);

        try {
            await this.ensureCacheDirectoryExists();
            await this.downloadVersion(packageName, version, versionDir);

            const size = await calculateDirectorySize(versionDir);
            if (size > MAX_VERSION_SIZE_BYTES) {
                this.logger.warn(`Downloaded version ${cacheKey} is very large: ${size} bytes`);
            }

            // Create cache entry
            const now = createTimestamp();
            const entry: CacheEntry = {
                key: cacheKey,
                path: versionDir,
                packageName,
                version,
                downloadedAt: now,
                lastUsedAt: now,
                size
            };
            await this.addCacheEntry(entry);

            this.logger.debug(`Successfully cached ${cacheKey} (${size} bytes) at ${versionDir}`);
            return entry;
        } catch (error) {
            try {
                if (await doesPathExist(versionDir)) {
                    await rm(versionDir, { recursive: true, force: true });
                }
            } catch {
                // Ignore cleanup errors
            }

            this.logger.error(`Failed to cache version ${cacheKey}: ${String(error)}`);
            throw error;
        }
    }

    /**
     * Execute a command using a cached version
     */
    async executeFromCache(
        entry: CacheEntry,
        args: string[],
        env?: Record<string, string>
    ): Promise<CacheExecutionResult> {
        this.logger.debug(`Executing from cache: ${entry.key} with args [${args.join(", ")}]`);

        try {
            // Find the executable
            const executablePath = await findPackageExecutable(entry.path, entry.packageName);
            if (!executablePath) {
                throw new Error(`Could not find executable for ${entry.key} in ${entry.path}`);
            }
            this.logger.debug(`Found executable at ${executablePath}`);

            // Execute the command
            const { failed, stdout, stderr } = await loggingExeca(this.logger, "node", [executablePath, ...args], {
                stdio: "inherit",
                reject: false,
                env: {
                    ...env,
                    [FERN_CWD_ENV_VAR]: process.env[FERN_CWD_ENV_VAR] ?? process.cwd()
                }
            });

            const result: CacheExecutionResult = {
                success: !failed,
                exitCode: failed ? 1 : 0,
                stdout,
                stderr
            };

            // Update last used timestamp on successful execution
            if (!failed) {
                await this.updateLastUsed(entry);
            }

            return result;
        } catch (error) {
            this.logger.error(`Failed to execute cached version ${entry.key}: ${String(error)}`);
            return {
                success: false,
                exitCode: 1,
                stderr: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(): Promise<{ entryCount: number; totalSize: number; entries: CacheEntry[] }> {
        if (this.options.disabled) {
            return { entryCount: 0, totalSize: 0, entries: [] };
        }

        try {
            const metadata = await this.loadMetadata();
            const totalSize = metadata.entries.reduce((sum, entry) => sum + entry.size, 0);

            return {
                entryCount: metadata.entries.length,
                totalSize,
                entries: [...metadata.entries] // Return a copy
            };
        } catch {
            return { entryCount: 0, totalSize: 0, entries: [] };
        }
    }

    /**
     * Clear all cached versions
     */
    async clearCache(): Promise<void> {
        if (this.options.disabled) {
            return;
        }

        this.logger.debug("Clearing version cache");

        try {
            const cacheDir = this.options.cacheDirectory;

            if (await doesPathExist(cacheDir)) {
                await rm(cacheDir, { recursive: true, force: true });
            }

            // Clear in-memory cache
            this.cachedMetadata = null;

            this.logger.debug("Version cache cleared");
        } catch (error) {
            this.logger.error(`Failed to clear cache: ${String(error)}`);
            throw error;
        }
    }

    /**
     * Load cache metadata from disk
     */
    private async loadMetadata(): Promise<CacheMetadata> {
        if (this.cachedMetadata) {
            return this.cachedMetadata;
        }

        const metadataPath = getCacheMetadataPath();

        try {
            if (!(await doesPathExist(metadataPath))) {
                // Create default metadata
                const defaultMetadata: CacheMetadata = {
                    maxSize: this.options.maxSize,
                    entries: [],
                    schemaVersion: CACHE_METADATA_SCHEMA_VERSION,
                    lastUpdated: createTimestamp()
                };

                await this.saveMetadata(defaultMetadata);
                this.cachedMetadata = defaultMetadata;
                return defaultMetadata;
            }

            const content = await readFile(metadataPath, "utf-8");
            const metadata = JSON.parse(content) as CacheMetadata;

            // Validate and potentially migrate metadata
            if (metadata.schemaVersion !== CACHE_METADATA_SCHEMA_VERSION) {
                this.logger.debug(
                    `Migrating cache metadata from version ${metadata.schemaVersion} to ${CACHE_METADATA_SCHEMA_VERSION}`
                );
                // I doubt we'll ever need to, but if you were to add migration logic, here it would be
            }

            if (metadata.maxSize !== this.options.maxSize) {
                metadata.maxSize = this.options.maxSize;
                await this.saveMetadata(metadata);
            }

            this.cachedMetadata = metadata;
            return metadata;
        } catch (error) {
            this.logger.debug(`Failed to load cache metadata, creating new: ${String(error)}`);

            // Create fresh metadata on error
            const freshMetadata: CacheMetadata = {
                maxSize: this.options.maxSize,
                entries: [],
                schemaVersion: CACHE_METADATA_SCHEMA_VERSION,
                lastUpdated: createTimestamp()
            };

            await this.saveMetadata(freshMetadata);
            this.cachedMetadata = freshMetadata;
            return freshMetadata;
        }
    }

    /**
     * Save cache metadata to disk
     */
    private async saveMetadata(metadata: CacheMetadata): Promise<void> {
        metadata.lastUpdated = createTimestamp();

        const metadataPath = getCacheMetadataPath();
        const content = JSON.stringify(metadata, null, 2);

        await writeFile(metadataPath, content, "utf-8");
        this.cachedMetadata = metadata;
    }

    /**
     * Add a new cache entry and handle eviction if needed
     */
    private async addCacheEntry(entry: CacheEntry): Promise<void> {
        const metadata = await this.loadMetadata();

        // Remove any existing entry with the same key
        metadata.entries = metadata.entries.filter((e) => e.key !== entry.key);

        // Add new entry at the beginning (most recently used)
        metadata.entries.unshift(entry);

        // Evict oldest entries if over the limit
        while (metadata.entries.length > metadata.maxSize) {
            const oldestEntry = metadata.entries.pop();
            if (oldestEntry) {
                this.logger.debug(`Evicting cached version ${oldestEntry.key} due to size limit`);
                await this.removeCacheDirectory(oldestEntry.path);
            }
        }

        await this.saveMetadata(metadata);
    }

    /**
     * Remove a cache entry by key
     */
    private async removeCacheEntry(cacheKey: string): Promise<void> {
        const metadata = await this.loadMetadata();

        const entryIndex = metadata.entries.findIndex((e) => e.key === cacheKey);
        if (entryIndex >= 0) {
            const entry = metadata.entries[entryIndex];
            if (entry) {
                metadata.entries.splice(entryIndex, 1);

                await this.removeCacheDirectory(entry.path);

                await this.saveMetadata(metadata);
                this.logger.debug(`Removed cache entry ${cacheKey}`);
            }
        }
    }

    /**
     * Update the last used timestamp for a cache entry
     */
    private async updateLastUsed(entry: CacheEntry): Promise<void> {
        const metadata = await this.loadMetadata();

        const existingEntry = metadata.entries.find((e) => e.key === entry.key);
        if (existingEntry) {
            existingEntry.lastUsedAt = createTimestamp();

            // Move to front (most recently used)
            metadata.entries = metadata.entries.filter((e) => e.key !== entry.key);
            metadata.entries.unshift(existingEntry);

            await this.saveMetadata(metadata);
        }
    }

    /**
     * Download a version using npm
     */
    private async downloadVersion(packageName: string, version: string, targetDir: AbsoluteFilePath): Promise<void> {
        const packageSpec = `${packageName}@${version}`;

        this.logger.debug(`Downloading ${packageSpec} to ${targetDir}`);

        // Ensure parent directory exists
        await mkdir(path.dirname(targetDir), { recursive: true });

        // Use npm install to download the package (output hidden for clean UX)
        const { failed, stdout, stderr } = await loggingExeca(
            this.logger,
            "npm",
            ["install", "--yes", "--no-save", "--no-package-lock", "--prefix", targetDir, packageSpec],
            {
                reject: false,
                timeout: this.options.downloadTimeoutMs,
                stdio: "pipe", // Hide npm output from user
                env: {
                    // Disable npm audit and fund messages
                    npm_config_audit: "false",
                    npm_config_fund: "false",
                    npm_config_progress: "false",
                    npm_config_loglevel: "silent" // Make npm even quieter
                }
            }
        );

        if (failed) {
            // Log the npm error for debugging but don't show to user
            this.logger.debug(`npm install failed with stdout: ${stdout}`);
            this.logger.debug(`npm install failed with stderr: ${stderr}`);
            throw new Error(`Failed to download ${packageSpec}: ${stderr || stdout || "Unknown error"}`);
        }

        this.logger.debug(`Successfully downloaded ${packageSpec}`);
    }

    /**
     * Remove a cache directory safely
     */
    private async removeCacheDirectory(dirPath: AbsoluteFilePath): Promise<void> {
        try {
            if (await doesPathExist(dirPath)) {
                await rm(dirPath, { recursive: true, force: true });
                this.logger.debug(`Removed cache directory ${dirPath}`);
            }
        } catch (error) {
            this.logger.warn(`Failed to remove cache directory ${dirPath}: ${String(error)}`);
        }
    }

    /**
     * Ensure the cache directory structure exists
     */
    private async ensureCacheDirectoryExists(): Promise<void> {
        const cacheDir = this.options.cacheDirectory;
        await mkdir(cacheDir, { recursive: true });
    }

    /**
     * Parse max cache size from environment variable
     */
    private parseMaxSizeFromEnv(): number | undefined {
        const envValue = process.env[CACHE_SIZE_ENV_VAR];
        if (!envValue) {
            return undefined;
        }

        const parsed = parseInt(envValue, 10);
        if (isNaN(parsed) || parsed < 0) {
            this.logger.warn(`Invalid value for ${CACHE_SIZE_ENV_VAR}: ${envValue}, using default`);
            return undefined;
        }

        return parsed;
    }

    /**
     * Check if caching is disabled via environment variable
     */
    private isCacheDisabled(): boolean {
        const envValue = process.env[DISABLE_CACHE_ENV_VAR];
        return envValue === "true" || envValue === "1";
    }
}
