// Main cache class

// Constants
export {
    CACHE_DIRECTORY_ENV_VAR,
    CACHE_METADATA_FILENAME,
    CACHE_METADATA_SCHEMA_VERSION,
    CACHE_SIZE_ENV_VAR,
    DEFAULT_DOWNLOAD_TIMEOUT_MS,
    DEFAULT_FERN_CACHE_DIRECTORY,
    DEFAULT_FERN_VERSION_CACHE_SIZE,
    DISABLE_CACHE_ENV_VAR,
    MAX_VERSION_SIZE_BYTES,
    MIN_FREE_SPACE_BYTES
} from "./constants";

// Types and interfaces
export type {
    CacheEntry,
    CacheExecutionResult,
    CacheMetadata,
    VersionCacheOptions
} from "./types";

// Utility functions
export {
    calculateDirectorySize,
    createTimestamp,
    findPackageExecutable,
    formatBytes,
    getCacheDirectory,
    getCacheKey,
    getCacheMetadataPath,
    getVersionCacheDirectory,
    isValidPackageName,
    isValidVersion,
    parseTimestamp
} from "./utils";
export { VersionCache } from "./VersionCache";
