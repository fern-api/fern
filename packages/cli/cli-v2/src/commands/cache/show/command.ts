import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { formatBytes } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace ShowCommand {
    export interface Args extends GlobalArgs {
        json?: boolean;
    }
}

export class ShowCommand {
    public async handle(context: Context, args: ShowCommand.Args): Promise<void> {
        const { cache } = context;

        const stats = await cache.getStats();

        if (args.json) {
            const output = {
                paths: {
                    base: cache.absoluteFilePath,
                    ir: cache.ir.absoluteFilePath,
                    logs: cache.logs.absoluteFilePath,
                    docsPreview: cache.docsPreview.absoluteFilePath,
                    versions: cache.versions.absoluteFilePath
                },
                stats: {
                    totalSize: stats.totalSize,
                    totalSizeFormatted: formatBytes(stats.totalSize),
                    ir: {
                        entryCount: stats.ir.entryCount,
                        totalSize: stats.ir.totalSize,
                        totalSizeFormatted: formatBytes(stats.ir.totalSize),
                        byVersion: Object.entries(stats.ir.byVersion).map(([version, versionStats]) => ({
                            version,
                            entries: versionStats.entryCount,
                            size: versionStats.totalSize,
                            sizeFormatted: formatBytes(versionStats.totalSize)
                        }))
                    },
                    logs: {
                        fileCount: stats.logs.fileCount,
                        totalSize: stats.logs.totalSize,
                        totalSizeFormatted: formatBytes(stats.logs.totalSize)
                    },
                    docsPreview: {
                        bundleCount: stats.docsPreview.bundleCount,
                        totalSize: stats.docsPreview.totalSize,
                        totalSizeFormatted: formatBytes(stats.docsPreview.totalSize)
                    },
                    versions: {
                        entryCount: stats.versions.entryCount,
                        totalSize: stats.versions.totalSize,
                        totalSizeFormatted: formatBytes(stats.versions.totalSize),
                        byVersion: Object.entries(stats.versions.byVersion).map(([version, versionStats]) => ({
                            version,
                            size: versionStats.totalSize,
                            sizeFormatted: formatBytes(versionStats.totalSize)
                        }))
                    }
                }
            };
            context.stdout.info(JSON.stringify(output, null, 2));
            return;
        }

        context.stdout.info("Cache Location");
        context.stdout.info("==============");
        context.stdout.info(`Base:         ${cache.absoluteFilePath}`);
        context.stdout.info(`IR:           ${cache.ir.absoluteFilePath}`);
        context.stdout.info(`Logs:         ${cache.logs.absoluteFilePath}`);
        context.stdout.info(`Docs Preview: ${cache.docsPreview.absoluteFilePath}`);
        context.stdout.info(`Versions:     ${cache.versions.absoluteFilePath}`);
        context.stdout.info("");

        context.stdout.info("Cache Statistics");
        context.stdout.info("================");

        const isEmpty =
            stats.ir.entryCount === 0 &&
            stats.logs.fileCount === 0 &&
            stats.docsPreview.bundleCount === 0 &&
            stats.versions.entryCount === 0;
        if (isEmpty) {
            context.stdout.info("Cache is empty");
            return;
        }

        context.stdout.info(`Total size: ${formatBytes(stats.totalSize)}`);
        context.stdout.info("");

        if (stats.ir.entryCount > 0) {
            context.stdout.info("IR Cache:");
            context.stdout.info(`  ${stats.ir.entryCount} entries (${formatBytes(stats.ir.totalSize)})`);

            if (Object.keys(stats.ir.byVersion).length > 0) {
                // Sort versions in descending order (newest first).
                const sortedVersions = Object.entries(stats.ir.byVersion).sort(([a], [b]) => {
                    const numA = parseInt(a.replace("v", ""), 10);
                    const numB = parseInt(b.replace("v", ""), 10);
                    return numB - numA;
                });

                for (const [version, versionStats] of sortedVersions) {
                    context.stdout.info(
                        `    ${version}: ${versionStats.entryCount} entries (${formatBytes(versionStats.totalSize)})`
                    );
                }
            }
            context.stdout.info("");
        }

        if (stats.logs.fileCount > 0) {
            context.stdout.info("Logs:");
            context.stdout.info(`  ${stats.logs.fileCount} files (${formatBytes(stats.logs.totalSize)})`);
            context.stdout.info("");
        }

        if (stats.docsPreview.bundleCount > 0) {
            context.stdout.info("Docs Preview:");
            context.stdout.info(
                `  ${stats.docsPreview.bundleCount} bundles (${formatBytes(stats.docsPreview.totalSize)})`
            );
            context.stdout.info("");
        }

        if (stats.versions.entryCount > 0) {
            context.stdout.info("Versions:");
            context.stdout.info(`  ${stats.versions.entryCount} installed (${formatBytes(stats.versions.totalSize)})`);
            const sortedVersions = Object.entries(stats.versions.byVersion).sort(([a], [b]) => b.localeCompare(a));
            for (const [version, versionStats] of sortedVersions) {
                context.stdout.info(`    ${version}: ${formatBytes(versionStats.totalSize)}`);
            }
        }
    }
}

export function addShowCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ShowCommand();
    command(
        cli,
        "show",
        "Show cache location and statistics",
        (context, args) => cmd.handle(context, args as ShowCommand.Args),
        (yargs) =>
            yargs.option("json", {
                type: "boolean",
                description: "Output in JSON format",
                default: false
            })
    );
}
