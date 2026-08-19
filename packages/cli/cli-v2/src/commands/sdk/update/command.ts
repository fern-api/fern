import { extractErrorMessage } from "@fern-api/core-utils";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME } from "../../../config/fern-yml/constants.js";
import { FernYmlEditor } from "../../../config/fern-yml/FernYmlEditor.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { SdkChecker } from "../../../sdk/checker/SdkChecker.js";
import { GeneratorMigrator } from "../../../sdk/updater/GeneratorMigrator.js";
import { SdkUpdater } from "../../../sdk/updater/SdkUpdater.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
export declare namespace UpdateCommand {
    export interface Args extends GlobalArgs {
        /** The SDK target to update (e.g. typescript, python, go). */
        target?: string;

        /** Include major version upgrades. */
        major: boolean;

        /** Include pre-release versions (RC, alpha, beta, etc.). */
        prerelease: boolean;

        /** Accept all defaults (non-interactive mode). */
        yes: boolean;
    }
}

export class UpdateCommand {
    public async handle(context: Context, args: UpdateCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        const fernYmlPath = workspace.absoluteFilePath;
        if (fernYmlPath == null) {
            throw new CliError({
                message: `No ${FERN_YML_FILENAME} found. Run 'fern init' to initialize a project.`,
                code: CliError.Code.ConfigError
            });
        }

        const sdkChecker = new SdkChecker({ context });
        const sdkCheckResult = await sdkChecker.check({ workspace });
        if (sdkCheckResult.errorCount > 0) {
            throw new CliError({ code: CliError.Code.ValidationError });
        }

        const targets = workspace.sdks?.targets;
        if (targets == null || targets.length === 0) {
            context.stderr.info(chalk.dim("No SDK targets found in configuration."));
            return;
        }

        const updater = new SdkUpdater();
        const { updates, upToDate, skippedMajorUpgrades } = await updater.resolve({
            targets,
            targetFilter: args.target,
            includeMajor: args.major,
            prerelease: args.prerelease
        });

        // If no target matched the filter, it's an error.
        if (updates.length === 0 && upToDate.length === 0 && args.target != null) {
            throw new CliError({
                message: `Target '${args.target}' not found in ${FERN_YML_FILENAME}.`,
                code: CliError.Code.ConfigError
            });
        }

        if (updates.length === 0) {
            this.printUpToDate({ context, upToDate });
            this.printSkippedMajorUpgrades({ context, skippedMajorUpgrades });
            return;
        }

        // In interactive mode, let the user choose which targets to update.
        const selectedUpdates = context.isTTY && !args.yes ? await this.promptForUpdates({ updates }) : updates;

        if (selectedUpdates.length === 0) {
            context.stderr.info(chalk.dim("No targets selected for update."));
            return;
        }

        // Apply updates via FernYmlEditor.
        const editor = await FernYmlEditor.load({ fernYmlPath });

        const migrator = new GeneratorMigrator({
            logger: context.stderr,
            cachePath: context.cache.migrations.absoluteFilePath
        });
        const migrationInfo = new Map<string, GeneratorMigrator.MigrationInfo>();
        for (const update of selectedUpdates) {
            await editor.setTargetVersion(update.name, update.latestVersion);

            // Run generator config migrations for this version upgrade.
            const target = targets.find((t) => t.name === update.name);
            if (target != null) {
                try {
                    const result = await migrator.migrate({
                        target,
                        editor,
                        from: update.currentVersion,
                        to: update.latestVersion
                    });
                    if (result != null) {
                        migrationInfo.set(update.name, result);
                    }
                } catch (error) {
                    const message = extractErrorMessage(error);
                    context.stderr.warn(chalk.yellow(`  Warning: migrations failed for ${target.name}: ${message}`));
                }
            }
        }
        await editor.save();

        // Print results.
        this.printAppliedUpdates({ context, updates: selectedUpdates, migrationInfo });
        this.printUpToDate({ context, upToDate });
        this.printSkippedMajorUpgrades({ context, skippedMajorUpgrades });
    }

    private async promptForUpdates({
        updates
    }: {
        updates: SdkUpdater.TargetUpdate[];
    }): Promise<SdkUpdater.TargetUpdate[]> {
        if (updates.length === 1) {
            const update = updates[0];
            if (update == null) {
                return [];
            }
            return [update];
        }

        const { selected } = await inquirer.prompt<{ selected: string[] }>([
            {
                type: "checkbox",
                name: "selected",
                message: "Select targets to update:",
                choices: updates.map((update) => ({
                    name: `${update.name}: ${chalk.dim(update.currentVersion)} ${chalk.white("\u2192")} ${chalk.green(update.latestVersion)}`,
                    value: update.name,
                    checked: true
                }))
            }
        ]);

        return updates.filter((u) => selected.includes(u.name));
    }

    private printAppliedUpdates({
        context,
        updates,
        migrationInfo
    }: {
        context: Context;
        updates: SdkUpdater.TargetUpdate[];
        migrationInfo: Map<string, GeneratorMigrator.MigrationInfo>;
    }): void {
        if (updates.length === 0) {
            return;
        }

        context.stderr.info(`${Icons.success} ${chalk.green("Updated SDK targets:")}`);

        for (const update of updates) {
            context.stderr.info(
                chalk.green(`  ${update.name}: ${chalk.dim(update.currentVersion)} \u2192 ${update.latestVersion}`)
            );
            const migration = migrationInfo.get(update.name);
            if (migration != null) {
                context.stderr.info(
                    chalk.dim(
                        `    Applied ${migration.migrationsApplied} config migration(s): ${migration.appliedVersions.join(", ")}`
                    )
                );
            }
            if (update.changelogUrl != null) {
                context.stderr.info(chalk.dim(`    Changelog: ${update.changelogUrl}`));
            }
        }
    }

    private printUpToDate({ context, upToDate }: { context: Context; upToDate: SdkUpdater.TargetUpToDate[] }): void {
        if (upToDate.length === 0) {
            return;
        }

        context.stderr.info("");
        context.stderr.info(chalk.dim("Already on latest version:"));

        for (const item of upToDate) {
            context.stderr.info(chalk.dim(`  ${item.name}: ${item.version} (latest)`));
        }
    }

    private printSkippedMajorUpgrades({
        context,
        skippedMajorUpgrades
    }: {
        context: Context;
        skippedMajorUpgrades: SdkUpdater.SkippedMajorUpgrade[];
    }): void {
        if (skippedMajorUpgrades.length === 0) {
            return;
        }

        context.stderr.info("");
        context.stderr.info(chalk.yellow("Major version upgrades available:"));

        for (const upgrade of skippedMajorUpgrades) {
            context.stderr.info(
                chalk.yellow(`  ${upgrade.name}: ${upgrade.currentVersion} \u2192 ${upgrade.latestMajorVersion}`)
            );
            if (upgrade.changelogUrl != null) {
                context.stderr.info(chalk.yellow(`    Changelog: ${upgrade.changelogUrl}`));
            }
            context.stderr.info(chalk.yellow(`    Run: fern sdk update --target ${upgrade.name} --major`));
        }
    }
}

export function addUpdateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new UpdateCommand();
    command(
        cli,
        "update",
        "Update SDK targets to the latest version",
        (context, args) => cmd.handle(context, args as UpdateCommand.Args),
        (yargs) =>
            yargs
                .option("target", {
                    type: "string",
                    description: "The SDK target to update (e.g. typescript, python, go)"
                })
                .option("major", {
                    type: "boolean",
                    default: false,
                    description: "Include major version upgrades"
                })
                .option("prerelease", {
                    type: "boolean",
                    default: false,
                    description: "Include pre-release versions (RC, alpha, beta, etc.)"
                })
                .option("yes", {
                    type: "boolean",
                    description: "Accept all defaults (non-interactive mode)",
                    default: false
                })
    );
}
