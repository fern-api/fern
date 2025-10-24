import { AbsoluteFilePath, doesPathExist, getAllFilesInDirectory, join, RelativeFilePath } from "@fern-api/fs-utils";
import { stat } from "fs/promises";
import os from "os";
import path from "path";
import {
    CACHE_DIRECTORY_ENV_VAR,
    CACHE_METADATA_FILENAME,
    DEFAULT_FERN_CACHE_DIRECTORY,
} from "./constants";

/**
 * Creates a cache key from package name and version
 * @param packageName The npm package name (e.g., "fern-api")
 * @param version The package version (e.g., "0.30.0")
 * @returns Cache key string (e.g., "fern-api@0.30.0")
 */
export function getCacheKey(packageName: string, version: string): string {
    return `${packageName}@${version}`;
}

/**
 * Gets the absolute path to the Fern cache directory
 * Can be customized via FERN_VERSION_CACHE_DIRECTORY environment variable
 * @returns Absolute path to cache directory (default: ~/.fern/version-cache/)
 */
export function getCacheDirectory(): AbsoluteFilePath {
    // Check if custom cache directory is set via environment variable
    const customCacheDir = process.env[CACHE_DIRECTORY_ENV_VAR];
    if (customCacheDir) {
        return AbsoluteFilePath.of(customCacheDir);
    }

    // Use default cache directory
    const cacheDir = path.join(os.homedir(), DEFAULT_FERN_CACHE_DIRECTORY);
    return AbsoluteFilePath.of(cacheDir);
}

/**
 * Gets the absolute path to a specific version's cache directory
 * @param packageName The npm package name
 * @param version The package version
 * @returns Absolute path to ~/.fern/version-cache/fern-api@0.30.0/
 */
export function getVersionCacheDirectory(packageName: string, version: string): AbsoluteFilePath {
    const cacheKey = getCacheKey(packageName, version);
    return join(getCacheDirectory(), RelativeFilePath.of(cacheKey));
}

/**
 * Gets the absolute path to the cache metadata file
 * @returns Absolute path to ~/.fern/version-cache/cache-metadata.json
 */
export function getCacheMetadataPath(): AbsoluteFilePath {
    return join(getCacheDirectory(), RelativeFilePath.of(CACHE_METADATA_FILENAME));
}

/**
 * Calculates the total size of a directory in bytes
 * @param directoryPath Absolute path to the directory
 * @returns Total size in bytes, or 0 if directory doesn't exist
 */
export async function calculateDirectorySize(directoryPath: AbsoluteFilePath): Promise<number> {
    try {
        if (!(await doesPathExist(directoryPath))) {
            return 0;
        }

        let totalSize = 0;
        const files = await getAllFilesInDirectory(directoryPath);

        for (const file of files) {
            try {
                const stats = await stat(file);
                totalSize += stats.size;
            } catch {
                // Ignore files that can't be accessed
                continue;
            }
        }

        return totalSize;
    } catch {
        return 0;
    }
}

/**
 * Finds the executable file for a cached npm package
 * @param versionDirectory Absolute path to the cached version directory
 * @param packageName The package name to look for
 * @returns Absolute path to the executable, or null if not found
 */
export async function findPackageExecutable(
    versionDirectory: AbsoluteFilePath,
    packageName: string
): Promise<AbsoluteFilePath | null> {
    // Common locations for npm package executables
    const possiblePaths = [
        // Standard npm install structure
        join(versionDirectory, RelativeFilePath.of(`node_modules/.bin/${packageName}`)),
        join(versionDirectory, RelativeFilePath.of(`node_modules/.bin/fern`)),

        // Direct package structure (if installed as single package)
        join(versionDirectory, RelativeFilePath.of("bin/fern")),
        join(versionDirectory, RelativeFilePath.of(`bin/${packageName}`)),

        // Platform-specific executables
        join(versionDirectory, RelativeFilePath.of(`node_modules/.bin/${packageName}.cmd`)),
        join(versionDirectory, RelativeFilePath.of(`node_modules/.bin/fern.cmd`))
    ];

    for (const execPath of possiblePaths) {
        if (await doesPathExist(execPath)) {
            return execPath;
        }
    }

    return null;
}

/**
 * Formats a byte size into a human-readable string
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "45.2 MB")
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) {
        return "0 B";
    }

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Validates that a version string is valid semver-like format
 * @param version Version string to validate
 * @returns True if version looks valid
 */
export function isValidVersion(version: string): boolean {
    // Basic semver validation - allows prerelease tags
    const semverRegex =
        /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?(?:\+[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?$/;
    return semverRegex.test(version);
}

/**
 * Validates that a package name is valid npm package name format
 * @param packageName Package name to validate
 * @returns True if package name looks valid
 */
export function isValidPackageName(packageName: string): boolean {
    // Basic npm package name validation
    const packageNameRegex = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return packageNameRegex.test(packageName);
}

/**
 * Creates an ISO timestamp string for the current time
 * @returns ISO timestamp string
 */
export function createTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Parses an ISO timestamp string into a Date object
 * @param timestamp ISO timestamp string
 * @returns Date object, or null if parsing fails
 */
export function parseTimestamp(timestamp: string): Date | null {
    try {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}
