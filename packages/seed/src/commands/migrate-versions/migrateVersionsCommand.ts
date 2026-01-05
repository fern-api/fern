import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { Argv } from "yargs";
import {
    analyzeVersionsForMigration,
    createMigratedVersionsFile,
    printMigrationAnalysis
} from "../../utils/versionMigrationUtil";
import { TaskContextFactory } from "../test/TaskContextFactory";

interface MigrateVersionsArgs {
    path: string;
    output?: string;
    dryRun: boolean;
    analyze: boolean;
}

export function addMigrateVersionsCommand(yargs: Argv): void {
    yargs.command<MigrateVersionsArgs>(
        "migrate-versions",
        "Analyze and migrate versions.yml files to use automatic version computation",
        (args) => {
            return args
                .option("path", {
                    describe: "Path to the versions.yml file to analyze/migrate",
                    type: "string",
                    demandOption: true
                })
                .option("output", {
                    describe: "Output path for the migrated file (defaults to <path>.migrated)",
                    type: "string"
                })
                .option("dry-run", {
                    describe: "Only analyze the file, don't create migrated version",
                    type: "boolean",
                    default: false
                })
                .option("analyze", {
                    describe: "Show detailed analysis of version computation accuracy",
                    type: "boolean",
                    default: true
                });
        },
        async (args) => {
            const taskContextFactory = new TaskContextFactory("info");
            const context = taskContextFactory.create("migrate-versions");

            try {
                const absolutePath = AbsoluteFilePath.of(args.path);

                context.logger.info(chalk.bold("🔄 Analyzing versions.yml file for migration..."));
                context.logger.info(`📁 File: ${args.path}\n`);

                // Always perform analysis first
                const analysis = await analyzeVersionsForMigration({
                    absolutePathToVersions: absolutePath,
                    context
                });

                if (args.analyze) {
                    printMigrationAnalysis(analysis, context);
                }

                // Create migrated file unless dry-run
                if (!args.dryRun) {
                    if (analysis.canRemoveAllVersions) {
                        context.logger.info(chalk.green("\n✅ Creating migrated versions file..."));

                        const outputPath = args.output ? AbsoluteFilePath.of(args.output) : undefined;
                        const migratedPath = await createMigratedVersionsFile({
                            absolutePathToVersions: absolutePath,
                            outputPath,
                            context
                        });

                        context.logger.info(chalk.green("\n✨ Migration completed successfully!"));
                        context.logger.info(`📄 Migrated file: ${migratedPath}`);
                        context.logger.info("\n💡 Next steps:");
                        context.logger.info("  1. Review the migrated file");
                        context.logger.info("  2. Test with: pnpm seed validate --path <migrated-file>");
                        context.logger.info("  3. Replace the original file when ready");
                    } else {
                        context.logger.warn(chalk.yellow("\n⚠️  Migration skipped due to version mismatches."));
                        context.logger.info("Please review the recommendations above and fix changelog types");
                        context.logger.info("or adjust explicit versions before migrating.");
                    }
                } else {
                    context.logger.info(chalk.blue("\n🔍 Dry-run completed. No files were modified."));

                    if (analysis.canRemoveAllVersions) {
                        context.logger.info(chalk.green("✅ This file is ready for migration!"));
                        context.logger.info("Run without --dry-run to create the migrated file.");
                    }
                }
            } catch (error) {
                context.logger.error(chalk.red("❌ Migration failed:"));
                context.logger.error((error as Error).message);
                context.failAndThrow();
            }
        }
    );
}
