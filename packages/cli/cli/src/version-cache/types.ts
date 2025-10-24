import { AbsoluteFilePath } from "@fern-api/fs-utils";

/**
 * Represents a single cached version entry
 */
export interface CacheEntry {
    /** Unique cache key (e.g., "fern-api@0.30.0") */
    key: string;

    /** Absolute path to the cached package directory */
    path: AbsoluteFilePath;

    /** ISO timestamp when this version was first downloaded */
    downloadedAt: string;

    /** ISO timestamp when this version was last used */
    lastUsedAt: string;

    /** Size of the cached package in bytes */
    size: number;

    /** Package name (e.g., "fern-api") */
    packageName: string;

    /** Package version (e.g., "0.30.0") */
    version: string;
}

/**
 * Cache metadata stored in cache-metadata.json
 */
export interface CacheMetadata {
    /** Maximum number of versions to keep in cache */
    maxSize: number;

    /** List of cached entries, ordered by last used (most recent first) */
    entries: CacheEntry[];

    /** Schema version for future migrations */
    schemaVersion: number;

    /** When the metadata was last updated */
    lastUpdated: string;
}

/**
 * Result of executing a cached version
 */
export interface CacheExecutionResult {
    /** Whether the execution was successful */
    success: boolean;

    /** Exit code from the execution */
    exitCode: number;

    /** Standard output (if captured) */
    stdout?: string;

    /** Standard error (if captured) */
    stderr?: string;
}

/**
 * Configuration options for the version cache
 */
export interface VersionCacheOptions {
    /** Maximum number of versions to cache */
    maxSize?: number;

    /** Custom cache directory path */
    cacheDirectory?: AbsoluteFilePath;

    /** Whether to disable caching entirely */
    disabled?: boolean;

    /** Timeout for download operations in ms */
    downloadTimeoutMs?: number;
}

/**
 * Internal options type with all required properties after construction
 */
export interface InternalVersionCacheOptions {
    /** Maximum number of versions to cache */
    maxSize: number;

    /** Cache directory path (always defined) */
    cacheDirectory: AbsoluteFilePath;

    /** Whether caching is disabled */
    disabled: boolean;

    /** Timeout for download operations in ms */
    downloadTimeoutMs: number;
}

/**
 * Statistics about the version cache
 */
export interface CacheStats {
    /** Number of cached versions */
    entryCount: number;

    /** Total size of all cached versions in bytes */
    totalSize: number;

    /** Cache hit rate (between 0 and 1) */
    hitRate: number;

    /** Most recently used version */
    mostRecentVersion?: string;

    /** Least recently used version */
    leastRecentVersion?: string;
}
