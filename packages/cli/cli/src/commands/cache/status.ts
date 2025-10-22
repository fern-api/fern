import { CacheManager } from "@fern-api/generation-caching";
import chalk from "chalk";
import { createCliContext } from "../../cli-context/createCliContext";
import { CliCommand } from "../Command";

export const StatusCacheCommand: CliCommand = {
    command: "status",
    describe: "Show Fern generation cache status",
    builder: (yargs) => yargs,
    handler: async (argv) => {
        const context = createCliContext({ commandName: "cache status", ...argv });

        try {
            const cacheManager = new CacheManager({}, context);
            const stats = await cacheManager.getCacheStats();

            context.logger.info(chalk.bold("Fern Generation Cache Status"));
            context.logger.info("─".repeat(40));

            if (stats.irEntries === 0 && stats.apiRegEntries === 0) {
                context.logger.info(chalk.gray("Cache is empty"));
            } else {
                context.logger.info(`${chalk.cyan("IR Cache Entries:")} ${stats.irEntries}`);
                context.logger.info(`${chalk.cyan("API Registration Entries:")} ${stats.apiRegEntries}`);
                context.logger.info(`${chalk.cyan("Total Cache Size:")} ${stats.totalSize}`);
            }

            // Show cache location
            const cacheDir = process.env.HOME ? `${process.env.HOME}/.fern/cache` : "/tmp/.fern/cache";
            context.logger.info(`${chalk.gray("Cache Location:")} ${cacheDir}`);

            // Show benefits info
            if (stats.irEntries > 0 || stats.apiRegEntries > 0) {
                context.logger.info("");
                context.logger.info(chalk.green("Cache Benefits:"));
                if (stats.irEntries > 0) {
                    context.logger.info(`  • IR generation: ~${stats.irEntries * 200}ms saved per cache hit`);
                }
                if (stats.apiRegEntries > 0) {
                    context.logger.info(`  • API registration: ~${stats.apiRegEntries * 1000}ms saved per cache hit`);
                }
            }
        } catch (error) {
            context.logger.error(chalk.red("Failed to get cache status:"), error);
            process.exit(1);
        }
    }
};
