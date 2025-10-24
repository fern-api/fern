import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext";
import { VersionCache } from "../../version-cache";
import {
    CACHE_DIRECTORY_ENV_VAR,
    CACHE_SIZE_ENV_VAR,
    DEFAULT_FERN_VERSION_CACHE_SIZE,
    DISABLE_CACHE_ENV_VAR
} from "../../version-cache/constants";
import { formatBytes, getCacheDirectory } from "../../version-cache/utils";

export async function cacheInfo({ cliContext }: { cliContext: CliContext }): Promise<void> {
    const versionCache = new VersionCache(cliContext.logger);

    try {
        const stats = await versionCache.getCacheStats();

        // Cache Summary
        cliContext.logger.info("");
        cliContext.logger.info(chalk.bold("Cache Summary"));
        cliContext.logger.info(`├─ Entries: ${chalk.cyan(stats.entryCount)}`);
        cliContext.logger.info(`├─ Total Size: ${chalk.cyan(formatBytes(stats.totalSize))}`);

        // Get cache directory from the version cache implementation
        const cacheDir = getCacheDirectory();
        cliContext.logger.info(`└─ Location: ${chalk.dim(cacheDir)}`);
        cliContext.logger.info("");

        // Configuration section
        cliContext.logger.info(chalk.bold("Configuration (env variables)"));

        // Show version redirection warning if bypassed
        const noVersionRedirectionEnv = process.env["FERN_NO_VERSION_REDIRECTION"];
        const isVersionRedirectionDisabled = noVersionRedirectionEnv === "true" || noVersionRedirectionEnv === "1";

        if (isVersionRedirectionDisabled) {
            cliContext.logger.info(
                `├─ ${chalk.red("FERN_NO_VERSION_REDIRECTION: true - version cache is unused since CLI isn't being downloaded")}`
            );
        }

        // Show cache size configuration
        const cacheSizeEnv = process.env[CACHE_SIZE_ENV_VAR];
        let effectiveCacheSize = DEFAULT_FERN_VERSION_CACHE_SIZE;
        let cacheSizeDisplay = `${chalk.dim("unset, using default:")} ${chalk.cyan(effectiveCacheSize)}`;

        if (cacheSizeEnv) {
            const parsedSize = parseInt(cacheSizeEnv, 10);
            if (isNaN(parsedSize) || parsedSize < 0) {
                cacheSizeDisplay = `${chalk.dim("set to invalid value, using default:")} ${chalk.cyan(effectiveCacheSize)} ${chalk.yellow("[!]")}`;
            } else {
                effectiveCacheSize = parsedSize;
                cacheSizeDisplay = `${chalk.dim("set to:")} ${effectiveCacheSize}`;
            }
        }

        cliContext.logger.info(`├─ ${CACHE_SIZE_ENV_VAR}: ${cacheSizeDisplay}`);

        // Show custom directory configuration
        const customCacheDir = process.env[CACHE_DIRECTORY_ENV_VAR];
        let cacheDirDisplay = `${chalk.dim("unset, using default:")} ${chalk.cyan(getCacheDirectory())}`;

        if (customCacheDir) {
            cacheDirDisplay = `${chalk.dim("set:")} ${chalk.cyan(customCacheDir)}`;
        }

        cliContext.logger.info(`├─ ${CACHE_DIRECTORY_ENV_VAR}: ${cacheDirDisplay}`);

        // Show cache enabled/disabled configuration
        const disableCacheEnv = process.env[DISABLE_CACHE_ENV_VAR];
        const isCachingDisabled = disableCacheEnv === "true" || disableCacheEnv === "1";
        let cachingStatusDisplay = `${chalk.dim("unset, using default:")} ${chalk.cyan("false")} ${chalk.green("(caching enabled)")}`;

        if (disableCacheEnv) {
            if (isCachingDisabled) {
                cachingStatusDisplay = `${chalk.dim("set:")} ${chalk.cyan(disableCacheEnv)} ${chalk.red("(caching disabled)")}`;
            } else {
                cachingStatusDisplay = `${chalk.dim("set to non-true value:")} ${chalk.cyan(disableCacheEnv)} ${chalk.green("(caching enabled)")}`;
            }
        }

        cliContext.logger.info(`└─ ${DISABLE_CACHE_ENV_VAR}: ${cachingStatusDisplay}`);

        // Individual Entries Table
        cliContext.logger.info("");
        if (stats.entryCount === 0) {
            cliContext.logger.info(chalk.dim("No cached versions found."));
            return;
        }

        cliContext.logger.info(chalk.bold("Cached Versions"));

        // Table header
        const packageHeader = "Package@Version";
        const sizeHeader = "Size";
        const lastUsedHeader = "Last Used";
        const downloadedHeader = "Downloaded";

        // Calculate column widths based on content
        const packageWidth =
            Math.max(
                packageHeader.length,
                ...stats.entries.map((entry) => `${entry.packageName}@${entry.version}`.length)
            ) + 2;
        const sizeWidth =
            Math.max(sizeHeader.length, ...stats.entries.map((entry) => formatBytes(entry.size).length)) + 2;
        const lastUsedWidth = Math.max(lastUsedHeader.length, ...stats.entries.map(() => "2 hours ago".length)) + 2;
        const downloadedWidth = Math.max(downloadedHeader.length, ...stats.entries.map(() => "2024-10-24".length)) + 2;

        // Print table border and header
        const topBorder =
            "┌─" +
            "─".repeat(packageWidth) +
            "┬─" +
            "─".repeat(sizeWidth) +
            "┬─" +
            "─".repeat(lastUsedWidth) +
            "┬─" +
            "─".repeat(downloadedWidth) +
            "┐";
        const headerSep =
            "├─" +
            "─".repeat(packageWidth) +
            "┼─" +
            "─".repeat(sizeWidth) +
            "┼─" +
            "─".repeat(lastUsedWidth) +
            "┼─" +
            "─".repeat(downloadedWidth) +
            "┤";
        const bottomBorder =
            "└─" +
            "─".repeat(packageWidth) +
            "┴─" +
            "─".repeat(sizeWidth) +
            "┴─" +
            "─".repeat(lastUsedWidth) +
            "┴─" +
            "─".repeat(downloadedWidth) +
            "┘";

        cliContext.logger.info(topBorder);
        cliContext.logger.info(
            `│ ${chalk.bold(packageHeader.padEnd(packageWidth))}│ ${chalk.bold(sizeHeader.padEnd(sizeWidth))}│ ${chalk.bold(lastUsedHeader.padEnd(lastUsedWidth))}│ ${chalk.bold(downloadedHeader.padEnd(downloadedWidth))}│`
        );
        cliContext.logger.info(headerSep);

        // Print each entry
        for (const entry of stats.entries) {
            const packageCell = `${entry.packageName}@${entry.version}`.padEnd(packageWidth);
            const sizeCell = formatBytes(entry.size).padEnd(sizeWidth);
            const lastUsedCell = formatRelativeTime(entry.lastUsedAt).padEnd(lastUsedWidth);
            const downloadedCell = formatDate(entry.downloadedAt).padEnd(downloadedWidth);

            cliContext.logger.info(`│ ${packageCell}│ ${sizeCell}│ ${lastUsedCell}│ ${downloadedCell}│`);
        }

        cliContext.logger.info(bottomBorder);
        cliContext.logger.info("");

        // Track command usage
        cliContext.instrumentPostHogEvent({
            command: "fern cache info",
            properties: {
                entryCount: stats.entryCount,
                totalSize: stats.totalSize
            }
        });
    } catch (error) {
        cliContext.logger.error(`Failed to get cache information: ${error}`);
        cliContext.failWithoutThrowing();
    }
}

function formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
        return "< 1 hour ago";
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    } else if (diffDays === 1) {
        return "1 day ago";
    } else {
        return `${diffDays} days ago`;
    }
}

function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const isoString = date.toISOString();
    const datePart = isoString.split("T")[0];
    return datePart ?? isoString; // Fallback to full ISO string if split fails
}
