/**
 * Default maximum number of versions to keep in the cache;
 * can be overridden via environment variable CACHE_SIZE_ENV_VAR
 */
export const DEFAULT_FERN_VERSION_CACHE_SIZE = 5;

/**
 * Default name of the Fern cache directory in user's home directory;
 * can be overridden via environment variable CACHE_DIRECTORY_ENV_VAR
 */
export const DEFAULT_FERN_CACHE_DIRECTORY = ".fern/version-cache";

/**
 * Environment variable to set custom cache size
 */
export const CACHE_SIZE_ENV_VAR = "FERN_VERSION_CACHE_SIZE";

/**
 * Environment variable to set custom cache directory
 */
export const CACHE_DIRECTORY_ENV_VAR = "FERN_VERSION_CACHE_DIRECTORY";

/**
 * Environment variable to disable version caching
 */
export const DISABLE_CACHE_ENV_VAR = "FERN_NO_VERSION_CACHE";

/**
 * Filename for cache metadata
 */
export const CACHE_METADATA_FILENAME = "cache-metadata.json";

/**
 * Current schema version for cache metadata
 * Increment when making breaking changes to metadata format
 */
export const CACHE_METADATA_SCHEMA_VERSION = 1;

/**
 * Default timeout for npm download operations (in milliseconds)
 */
export const DEFAULT_DOWNLOAD_TIMEOUT_MS = 60000; // 1 minute

/**
 * Minimum free disk space required before downloading (in bytes)
 * Default: 100 MB
 */
export const MIN_FREE_SPACE_BYTES = 100 * 1024 * 1024;

/**
 * Maximum size for a single cached version (in bytes)
 * Default: 200 MB
 */
export const MAX_VERSION_SIZE_BYTES = 200 * 1024 * 1024;

/**
 * How often to clean up orphaned cache entries (in days)
 */
export const CACHE_CLEANUP_INTERVAL_DAYS = 30;

/**
 * Maximum age for unused cache entries before cleanup (in days)
 */
export const MAX_UNUSED_CACHE_AGE_DAYS = 90;
