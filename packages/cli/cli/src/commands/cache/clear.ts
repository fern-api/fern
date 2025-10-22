import { CacheManager } from "@fern-api/generation-caching";
import chalk from "chalk";
import { createCliContext } from "../../cli-context/createCliContext";
import { CliCommand } from "../Command";

export const ClearCacheCommand: CliCommand = {
    command: "clear",
    describe: "Clear the Fern generation cache",
    builder: (yargs) => {
        return yargs.option("all", {
            type: "boolean",
            describe: "Clear all cache types (IR and API registration)",
            default: true
        });
    },
    handler: async (argv) => {
        const context = createCliContext({ commandName: "cache clear", ...argv });

        try {
            const cacheManager = new CacheManager({}, context);
            await cacheManager.clearCache();

            context.logger.info(chalk.green("✓ Cache cleared successfully"));

            // Show stats after clearing
            const stats = await cacheManager.getCacheStats();
            if (stats.irEntries === 0 && stats.apiRegEntries === 0) {
                context.logger.info(chalk.gray("Cache is now empty"));
            } else {
                context.logger.warn(
                    chalk.yellow(
                        `Warning: Some cache entries may still exist (IR: ${stats.irEntries}, API: ${stats.apiRegEntries})`
                    )
                );
            }
        } catch (error) {
            context.logger.error(chalk.red("Failed to clear cache:"), error);
            process.exit(1);
        }
    }
};
