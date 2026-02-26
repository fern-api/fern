import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { readFile } from "fs/promises";
import inquirer from "inquirer";
import { parseDocument } from "yaml";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME, REF_KEY } from "../../../config/fern-yml/constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { LANGUAGE_TO_DOCKER_IMAGE } from "../../../sdk/config/converter/constants.js";
import { SdkUpdater } from "../../../sdk/updater/SdkUpdater.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

const CHANGELOG_URLS: Record<string, string> = {
    "fernapi/fern-typescript-sdk": "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
    "fernapi/fern-python-sdk": "https://buildwithfern.com/learn/sdks/generators/python/changelog",
    "fernapi/fern-go-sdk": "https://buildwithfern.com/learn/sdks/generators/go/changelog",
    "fernapi/fern-java-sdk": "https://buildwithfern.com/learn/sdks/generators/java/changelog",
    "fernapi/fern-csharp-sdk": "https://buildwithfern.com/learn/sdks/generators/csharp/changelog",
    "fernapi/fern-php-sdk": "https://buildwithfern.com/learn/sdks/generators/php/changelog",
    "fernapi/fern-ruby-sdk": "https://buildwithfern.com/learn/sdks/generators/ruby/changelog",
    "fernapi/fern-swift-sdk": "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
};

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
                message: `No ${FERN_YML_FILENAME} found. Run 'fern init' to initialize a project.`
            });
        }

        const targets = workspace.sdks?.targets;
        if (targets == null || targets.length === 0) {
            context.stderr.info(chalk.dim("No SDK targets found in configuration."));
            return;
        }

        const updater = new SdkUpdater({ context });

        // Collect eligible target entries from the workspace.
        const entries = updater.collectTargetEntries({ targets, targetFilter: args.target });
        if (entries.length === 0) {
            if (args.target != null) {
                throw new CliError({
                    message: `Target '${args.target}' not found in ${FERN_YML_FILENAME}.`
                });
            }
            context.stderr.info(chalk.dim("No SDK targets with pinned versions found."));
            return;
        }

        // Resolve the latest versions for each target.
        const { updates, upToDate, skippedMajorUpgrades } = await updater.resolveUpdates({
            entries,
            includeMajor: args.major,
            prerelease: args.prerelease
        });

        if (updates.length === 0) {
            this.printUpToDate({ context, upToDate });
            this.printSkippedMajorUpgrades({ context, skippedMajorUpgrades });
            return;
        }

        // In interactive mode, let the user choose which targets to update.
        const selectedUpdates = !context.isTTY || args.yes ? updates : await this.promptForUpdates({ updates });

        if (selectedUpdates.length === 0) {
            context.stderr.info(chalk.dim("No targets selected for update."));
            return;
        }

        // Resolve the targets file path (handles $ref).
        const { targetsFilePath, targetsPath } = await this.resolveTargetsFile(fernYmlPath);

        // Apply the selected updates atomically (all-or-nothing).
        await updater.applyUpdates({ targetsFilePath, targetsPath, updates: selectedUpdates });

        // Print the results.
        this.printAppliedUpdates({ context, updates: selectedUpdates });
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
            const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
                {
                    type: "confirm",
                    name: "confirm",
                    message: `Update ${update.name} from ${chalk.dim(update.currentVersion)} to ${chalk.green(update.latestVersion)}?`,
                    default: true
                }
            ]);
            return confirm ? [update] : [];
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

    private printAppliedUpdates({ context, updates }: { context: Context; updates: SdkUpdater.TargetUpdate[] }): void {
        if (updates.length === 0) {
            return;
        }

        context.stderr.info("");
        context.stderr.info(`${Icons.success} ${chalk.green("Updated SDK targets:")}`);

        for (const update of updates) {
            context.stderr.info(
                chalk.green(`  ${update.name}: ${chalk.dim(update.currentVersion)} \u2192 ${update.latestVersion}`)
            );
            const changelogUrl = CHANGELOG_URLS[update.image];
            if (changelogUrl != null) {
                context.stderr.info(chalk.dim(`    Changelog: ${changelogUrl}`));
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
            const image = this.findImageForTarget(upgrade.name);
            if (image != null) {
                const changelogUrl = CHANGELOG_URLS[image];
                if (changelogUrl != null) {
                    context.stderr.info(chalk.yellow(`    Changelog: ${changelogUrl}`));
                }
            }
            context.stderr.info(chalk.yellow(`    Run: fern sdk update --target ${upgrade.name} --major`));
        }
    }

    private findImageForTarget(name: string): string | undefined {
        const language = name as keyof typeof LANGUAGE_TO_DOCKER_IMAGE;
        return LANGUAGE_TO_DOCKER_IMAGE[language];
    }

    /**
     * Resolves the file that actually contains the `targets` key.
     *
     * If the `sdks` value in fern.yml is a `$ref`, we follow it and return
     * the referenced file's path instead.
     */
    private async resolveTargetsFile(
        fernYmlPath: AbsoluteFilePath
    ): Promise<{ targetsFilePath: AbsoluteFilePath; targetsPath: string[] }> {
        const content = await readFile(fernYmlPath, "utf-8");
        const document = parseDocument(content);
        const doc = document.toJS() as Record<string, unknown>;

        if (doc == null || typeof doc !== "object") {
            throw new CliError({
                message: `Invalid ${FERN_YML_FILENAME}: expected a YAML object; run 'fern init' to initialize a new file.`
            });
        }

        // Check if sdks uses a $ref.
        const sdksValue = doc.sdks;
        if (sdksValue != null && typeof sdksValue === "object" && REF_KEY in sdksValue) {
            const refPath = (sdksValue as Record<string, unknown>)[REF_KEY];
            if (typeof refPath === "string") {
                const resolvedPath = join(dirname(fernYmlPath), RelativeFilePath.of(refPath));
                if (await doesPathExist(resolvedPath)) {
                    return { targetsFilePath: resolvedPath, targetsPath: ["targets"] };
                }
            }
        }

        return { targetsFilePath: fernYmlPath, targetsPath: ["sdks", "targets"] };
    }
}

export function addUpdateCommand(cli: Argv<GlobalArgs>, parentPath?: string): void {
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
                    alias: "y",
                    description: "Accept all defaults (non-interactive mode)",
                    default: false
                }),
        parentPath
    );
}
