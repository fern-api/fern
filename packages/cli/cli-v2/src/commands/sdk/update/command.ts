import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import { type Document, parseDocument } from "yaml";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME, REF_KEY } from "../../../config/fern-yml/constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { LANGUAGE_TO_DOCKER_IMAGE } from "../../../sdk/config/converter/constants.js";
import { LANGUAGE_DISPLAY_NAMES, LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import { Icons } from "../../../ui/format.js";
import { Version } from "../../../version.js";
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

interface TargetUpdate {
    name: string;
    language: Language;
    image: string;
    currentVersion: string;
    latestVersion: string;
}

interface TargetUpToDate {
    name: string;
    language: Language;
    version: string;
}

interface SkippedMajorUpgrade {
    name: string;
    language: Language;
    currentVersion: string;
    latestMajorVersion: string;
}

export declare namespace UpdateCommand {
    export interface Args extends GlobalArgs {
        /** The SDK target to update (e.g. typescript, python, go). */
        target?: string;

        /** Include major version upgrades. */
        "include-major": boolean;

        /** Release channel (e.g. ga, rc). */
        channel?: string;

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

        const channel = this.parseChannel(args.channel);

        const { targetsFilePath, document, targetsPath } = await this.resolveTargetsDocument(fernYmlPath);

        const targetsNode = document.getIn(targetsPath);
        if (targetsNode == null) {
            context.stderr.info(chalk.dim("No SDK targets found in configuration."));
            return;
        }

        // Collect all target entries from the YAML document.
        const targetEntries = this.collectTargetEntries({ document, targetsPath, targetFilter: args.target });
        if (targetEntries.length === 0) {
            if (args.target != null) {
                throw new CliError({
                    message: `Target '${args.target}' not found in ${FERN_YML_FILENAME}.`
                });
            }
            context.stderr.info(chalk.dim("No SDK targets found in configuration."));
            return;
        }

        // Resolve the latest versions for each target.
        const updates: TargetUpdate[] = [];
        const upToDate: TargetUpToDate[] = [];
        const skippedMajorUpgrades: SkippedMajorUpgrade[] = [];

        for (const entry of targetEntries) {
            const result = await this.resolveTargetUpdate({
                context,
                entry,
                includeMajor: args["include-major"],
                channel
            });
            if (result.update != null) {
                updates.push(result.update);
            }
            if (result.upToDate != null) {
                upToDate.push(result.upToDate);
            }
            if (result.skippedMajor != null) {
                skippedMajorUpgrades.push(result.skippedMajor);
            }
        }

        if (updates.length === 0) {
            this.printUpToDate({ context, upToDate });
            this.printSkippedMajorUpgrades({ context, skippedMajorUpgrades });
            return;
        }

        // In interactive mode, let the user choose which targets to update.
        const selectedUpdates =
            !context.isTTY || args.yes ? updates : await this.promptForUpdates({ updates });

        if (selectedUpdates.length === 0) {
            context.stderr.info(chalk.dim("No targets selected for update."));
            return;
        }

        // Apply the selected updates to the YAML document.
        for (const update of selectedUpdates) {
            document.setIn([...targetsPath, update.name, "version"], update.latestVersion);
        }

        await writeFile(targetsFilePath, document.toString(), "utf-8");

        // Print the results.
        this.printAppliedUpdates({ context, updates: selectedUpdates });
        this.printUpToDate({ context, upToDate });
        this.printSkippedMajorUpgrades({ context, skippedMajorUpgrades });
    }

    private collectTargetEntries({
        document,
        targetsPath,
        targetFilter
    }: {
        document: Document;
        targetsPath: string[];
        targetFilter: string | undefined;
    }): Array<{ name: string; language: Language; image: string; currentVersion: string }> {
        const entries: Array<{ name: string; language: Language; image: string; currentVersion: string }> = [];
        const targetsNode = document.getIn(targetsPath);
        if (targetsNode == null || typeof targetsNode !== "object") {
            return entries;
        }

        // targetsNode is a YAML map; iterate over its entries.
        const targetsObj = document.getIn(targetsPath, true);
        if (targetsObj == null || !("items" in (targetsObj as object))) {
            return entries;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yamlMap = targetsObj as any;
        for (const item of yamlMap.items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const name = (item.key as any).value as string;

            if (targetFilter != null && name !== targetFilter) {
                continue;
            }

            const language = this.resolveLanguage(name, document, targetsPath);
            if (language == null) {
                continue;
            }

            const image = LANGUAGE_TO_DOCKER_IMAGE[language];
            const currentVersion = this.resolveCurrentVersion(document, targetsPath, name);
            if (currentVersion == null) {
                // Skip targets without an explicit version (using "latest").
                continue;
            }

            entries.push({ name, language, image, currentVersion });
        }

        return entries;
    }

    private resolveLanguage(name: string, document: Document, targetsPath: string[]): Language | undefined {
        // Check explicit lang property first.
        const lang = document.getIn([...targetsPath, name, "lang"]) as string | undefined;
        if (lang != null && LANGUAGES.includes(lang as Language)) {
            return lang as Language;
        }

        // Check explicit image property.
        const image = document.getIn([...targetsPath, name, "image"]) as string | undefined;
        if (image != null) {
            for (const [language, dockerImage] of Object.entries(LANGUAGE_TO_DOCKER_IMAGE)) {
                if (image === dockerImage || image.startsWith(`${dockerImage}:`)) {
                    return language as Language;
                }
            }
        }

        // Fall back to name matching.
        if (LANGUAGES.includes(name as Language)) {
            return name as Language;
        }

        return undefined;
    }

    private resolveCurrentVersion(document: Document, targetsPath: string[], name: string): string | undefined {
        const version = document.getIn([...targetsPath, name, "version"]) as string | undefined;
        if (version == null || version === "latest") {
            return undefined;
        }
        return version;
    }

    private async resolveTargetUpdate({
        context,
        entry,
        includeMajor,
        channel
    }: {
        context: Context;
        entry: { name: string; language: Language; image: string; currentVersion: string };
        includeMajor: boolean;
        channel: "GA" | "RC" | undefined;
    }): Promise<{
        update?: TargetUpdate;
        upToDate?: TargetUpToDate;
        skippedMajor?: SkippedMajorUpgrade;
    }> {
        const latestVersion = await getLatestGeneratorVersion({
            generatorName: entry.image,
            cliVersion: Version,
            currentGeneratorVersion: entry.currentVersion,
            channel,
            includeMajor
        });

        let update: TargetUpdate | undefined;
        let upToDate: TargetUpToDate | undefined;
        let skippedMajor: SkippedMajorUpgrade | undefined;

        if (latestVersion != null && latestVersion !== entry.currentVersion) {
            update = {
                name: entry.name,
                language: entry.language,
                image: entry.image,
                currentVersion: entry.currentVersion,
                latestVersion
            };
        } else {
            upToDate = {
                name: entry.name,
                language: entry.language,
                version: entry.currentVersion
            };
        }

        // Check for skipped major upgrades.
        if (!includeMajor) {
            const latestMajorVersion = await getLatestGeneratorVersion({
                generatorName: entry.image,
                cliVersion: Version,
                currentGeneratorVersion: latestVersion ?? entry.currentVersion,
                channel,
                includeMajor: true
            });

            if (latestMajorVersion != null) {
                const currentMajor = this.parseMajorVersion(latestVersion ?? entry.currentVersion);
                const latestMajor = this.parseMajorVersion(latestMajorVersion);

                if (currentMajor != null && latestMajor != null && latestMajor > currentMajor) {
                    skippedMajor = {
                        name: entry.name,
                        language: entry.language,
                        currentVersion: latestVersion ?? entry.currentVersion,
                        latestMajorVersion
                    };
                }
            }
        }

        return { update, upToDate, skippedMajor };
    }

    private parseMajorVersion(version: string): number | undefined {
        const match = /^(\d+)\./.exec(version);
        if (match?.[1] == null) {
            return undefined;
        }
        return parseInt(match[1], 10);
    }

    private async promptForUpdates({ updates }: { updates: TargetUpdate[] }): Promise<TargetUpdate[]> {
        if (updates.length === 1) {
            const update = updates[0];
            if (update == null) {
                return [];
            }
            const displayName = LANGUAGE_DISPLAY_NAMES[update.language] ?? update.name;
            const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
                {
                    type: "confirm",
                    name: "confirm",
                    message: `Update ${displayName} from ${chalk.dim(update.currentVersion)} to ${chalk.green(update.latestVersion)}?`,
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
                choices: updates.map((update) => {
                    const displayName = LANGUAGE_DISPLAY_NAMES[update.language] ?? update.name;
                    return {
                        name: `${displayName}: ${chalk.dim(update.currentVersion)} ${chalk.white("→")} ${chalk.green(update.latestVersion)}`,
                        value: update.name,
                        checked: true
                    };
                })
            }
        ]);

        return updates.filter((u) => selected.includes(u.name));
    }

    private printAppliedUpdates({
        context,
        updates
    }: {
        context: Context;
        updates: TargetUpdate[];
    }): void {
        if (updates.length === 0) {
            return;
        }

        context.stderr.info("");
        context.stderr.info(`${Icons.success} ${chalk.green("Updated SDK targets:")}`);

        for (const update of updates) {
            const displayName = LANGUAGE_DISPLAY_NAMES[update.language] ?? update.name;
            context.stderr.info(
                chalk.green(`  ${displayName}: ${chalk.dim(update.currentVersion)} → ${update.latestVersion}`)
            );
            const changelogUrl = CHANGELOG_URLS[update.image];
            if (changelogUrl != null) {
                context.stderr.info(chalk.dim(`    Changelog: ${changelogUrl}`));
            }
        }
    }

    private printUpToDate({
        context,
        upToDate
    }: {
        context: Context;
        upToDate: TargetUpToDate[];
    }): void {
        if (upToDate.length === 0) {
            return;
        }

        context.stderr.info("");
        context.stderr.info(chalk.dim("Already on latest version:"));

        for (const item of upToDate) {
            const displayName = LANGUAGE_DISPLAY_NAMES[item.language] ?? item.name;
            context.stderr.info(chalk.dim(`  ${displayName}: ${item.version} (latest)`));
        }
    }

    private printSkippedMajorUpgrades({
        context,
        skippedMajorUpgrades
    }: {
        context: Context;
        skippedMajorUpgrades: SkippedMajorUpgrade[];
    }): void {
        if (skippedMajorUpgrades.length === 0) {
            return;
        }

        context.stderr.info("");
        context.stderr.info(chalk.yellow("Major version upgrades available:"));

        for (const upgrade of skippedMajorUpgrades) {
            const displayName = LANGUAGE_DISPLAY_NAMES[upgrade.language] ?? upgrade.name;
            context.stderr.info(
                chalk.yellow(`  ${displayName}: ${upgrade.currentVersion} → ${upgrade.latestMajorVersion}`)
            );
            const changelogUrl = CHANGELOG_URLS[LANGUAGE_TO_DOCKER_IMAGE[upgrade.language]];
            if (changelogUrl != null) {
                context.stderr.info(chalk.yellow(`    Changelog: ${changelogUrl}`));
            }
            context.stderr.info(
                chalk.yellow(`    Run: fern sdk update --target ${upgrade.name} --include-major`)
            );
        }
    }

    /**
     * Resolves the file that contains the `targets` key and the YAML path to it.
     *
     * If the `sdks` value in fern.yml is a `$ref`, follows the reference.
     */
    private async resolveTargetsDocument(
        fernYmlPath: AbsoluteFilePath
    ): Promise<{ targetsFilePath: AbsoluteFilePath; document: Document; targetsPath: string[] }> {
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
                    const refContent = await readFile(resolvedPath, "utf-8");
                    const refDocument = parseDocument(refContent);
                    return { targetsFilePath: resolvedPath, document: refDocument, targetsPath: ["targets"] };
                }
            }
        }

        return { targetsFilePath: fernYmlPath, document, targetsPath: ["sdks", "targets"] };
    }

    private parseChannel(channel: string | undefined): "GA" | "RC" | undefined {
        if (channel == null) {
            return undefined;
        }
        switch (channel) {
            case "ga":
                return "GA";
            case "rc":
                return "RC";
            default:
                throw new CliError({
                    message: `Unknown channel "${channel}". Supported: ga, rc`
                });
        }
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
                .option("include-major", {
                    type: "boolean",
                    default: false,
                    description: "Include major version upgrades"
                })
                .option("channel", {
                    type: "string",
                    description: "Release channel (ga, rc)"
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
