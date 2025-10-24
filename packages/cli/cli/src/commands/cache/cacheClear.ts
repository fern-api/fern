import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext";
import { VersionCache } from "../../version-cache";

export async function cacheClear({ cliContext }: { cliContext: CliContext }): Promise<void> {
    const versionCache = new VersionCache(cliContext.logger);

    try {
        // Get stats before clearing for telemetry
        const statsBeforeClear = await versionCache.getCacheStats();

        cliContext.logger.debug("Clearing version cache...");

        // Clear the cache immediately (no confirmation per user preference)
        await versionCache.clearCache();

        cliContext.logger.info(chalk.green("✓ Cache cleared successfully"));

        // Track command usage
        cliContext.instrumentPostHogEvent({
            command: "fern cache clear",
            properties: {
                entriesCleared: statsBeforeClear.entryCount,
                totalSizeCleared: statsBeforeClear.totalSize
            }
        });
    } catch (error) {
        cliContext.logger.error(`Failed to clear cache: ${error}`);
        cliContext.failWithoutThrowing();
    }
}
