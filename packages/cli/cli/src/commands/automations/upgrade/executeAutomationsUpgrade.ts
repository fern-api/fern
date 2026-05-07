import {
    addDefaultDockerOrgIfNotPresent,
    FERN_DIRECTORY,
    getFernDirectory,
    getPathToGeneratorsConfiguration,
    loadProjectConfig
} from "@fern-api/configuration-loader";
import { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";

import { CliContext } from "../../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../../cliCommons.js";
import { upgrade } from "../../upgrade/upgrade.js";
import { loadAndUpdateGenerators } from "../../upgrade/upgradeGenerator.js";

const CHANGELOG_BASE = "https://buildwithfern.com/learn/sdks/generators";

/**
 * Derives the changelog URL from a generator name.
 * Generator names follow the pattern "fernapi/fern-<language>-sdk[-variant]",
 * and changelog pages live at buildwithfern.com/learn/sdks/generators/<language>/changelog.
 */
export function getChangelogUrl(generatorName: string): string | undefined {
    const match = generatorName.match(/^fernapi\/fern-([a-z]+)/);
    if (!match?.[1]) {
        return undefined;
    }
    return `${CHANGELOG_BASE}/${match[1]}/changelog`;
}

export interface AutomationsUpgradeOptions {
    includeMajor: boolean;
}

interface CliUpgradeResult {
    from: string;
    to: string;
    upgraded: boolean;
}

interface GeneratorUpgradeEntry {
    name: string;
    group: string;
    api: string | null;
    from: string;
    to: string;
    changelog: string | undefined;
    migrationsApplied: number;
}

interface SkippedMajorEntry {
    name: string;
    current: string;
    latest: string;
}

interface AlreadyUpToDateEntry {
    name: string;
    version: string;
}

interface PrSuggestion {
    title: string;
    body: string;
    commitMessage: string;
}

export interface AutomationsUpgradeResult {
    cli: CliUpgradeResult;
    generators: GeneratorUpgradeEntry[];
    skippedMajor: SkippedMajorEntry[];
    alreadyUpToDate: AlreadyUpToDateEntry[];
    pr: PrSuggestion | null;
}

/**
 * Reads the current CLI version from fern.config.json before any upgrade runs.
 */
async function getCurrentCliVersion(cliContext: CliContext): Promise<string> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`, undefined, {
            code: CliError.Code.ConfigError
        });
    }
    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );
    return projectConfig.version;
}

/**
 * Top-level runner for `fern automations upgrade`.
 *
 * Orchestrates both `fern upgrade` (CLI version) and `fern generator upgrade`
 * (generator versions), then outputs a structured JSON summary to stdout.
 *
 * The JSON output is designed for consumption by the fern-upgrade GitHub Action,
 * replacing the previous snapshot.js / diff.js approach with a single CLI call.
 *
 * JSON output format (on --json):
 *   {
 *     "cli": { "from": "4.66.0", "to": "4.96.0", "upgraded": true },
 *     "generators": [
 *       {
 *         "name": "fernapi/fern-typescript-sdk",
 *         "group": "ts-sdk",
 *         "api": "api",
 *         "from": "3.63.4",
 *         "to": "3.65.5",
 *         "changelog": "https://...",
 *         "migrationsApplied": 1
 *       }
 *     ],
 *     "skippedMajor": [{ "name": "...", "current": "...", "latest": "..." }],
 *     "alreadyUpToDate": [{ "name": "...", "version": "..." }],
 *     "pr": {
 *       "title": "chore(fern): upgrade CLI 4.66.0 → 4.96.0 and 2 generators",
 *       "body": "## Fern Upgrade\n...",
 *       "commitMessage": "chore: upgrade fern cli 4.66.0 -> 4.96.0, ..."
 *     }
 *   }
 */
export async function executeAutomationsUpgrade({
    cliContext,
    options
}: {
    cliContext: CliContext;
    options: AutomationsUpgradeOptions;
}): Promise<AutomationsUpgradeResult> {
    // 1. Capture the CLI version before upgrade
    const cliVersionBefore = await getCurrentCliVersion(cliContext);

    // 2. Run `fern upgrade --yes` to upgrade CLI version + run migrations
    cliContext.logger.info("Running CLI upgrade...");
    await upgrade({
        cliContext,
        includePreReleases: false,
        targetVersion: undefined,
        fromVersion: undefined,
        yes: true
    });

    // Read the CLI version after upgrade
    const cliVersionAfter = await getCurrentCliVersion(cliContext);
    const cliUpgraded = cliVersionBefore !== cliVersionAfter;

    if (cliUpgraded) {
        cliContext.logger.info(`CLI upgraded: ${chalk.dim(cliVersionBefore)} -> ${chalk.green(cliVersionAfter)}`);
    } else {
        cliContext.logger.info("CLI already up to date.");
    }

    // 3. Load project and run generator upgrades across all workspaces
    cliContext.logger.info("Running generator upgrades...");
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    const generatorResults = await upgradeGeneratorsForAllWorkspaces({
        cliContext,
        project,
        includeMajor: options.includeMajor
    });

    // 4. Build the structured result
    const cliResult: CliUpgradeResult = {
        from: cliVersionBefore,
        to: cliVersionAfter,
        upgraded: cliUpgraded
    };

    const hasChanges = cliUpgraded || generatorResults.generators.length > 0;
    const pr = hasChanges ? buildPrSuggestion({ cli: cliResult, generators: generatorResults.generators }) : null;

    const result: AutomationsUpgradeResult = {
        cli: cliResult,
        generators: generatorResults.generators,
        skippedMajor: generatorResults.skippedMajor,
        alreadyUpToDate: generatorResults.alreadyUpToDate,
        pr
    };

    return result;
}

/**
 * Runs generator upgrades across all API workspaces in the project,
 * collecting structured results instead of just logging to console.
 */
async function upgradeGeneratorsForAllWorkspaces({
    cliContext,
    project,
    includeMajor
}: {
    cliContext: CliContext;
    project: Project;
    includeMajor: boolean;
}): Promise<{
    generators: GeneratorUpgradeEntry[];
    skippedMajor: SkippedMajorEntry[];
    alreadyUpToDate: AlreadyUpToDateEntry[];
}> {
    const generators: GeneratorUpgradeEntry[] = [];
    const skippedMajor: SkippedMajorEntry[] = [];
    const alreadyUpToDate: AlreadyUpToDateEntry[] = [];

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const result = await loadAndUpdateGenerators({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context,
                    generatorFilter: undefined,
                    groupFilter: undefined,
                    includeMajor,
                    skipAutoreleaseDisabled: false,
                    channel: undefined,
                    cliVersion: cliContext.environment.packageVersion
                });

                const absolutePathToGeneratorsConfiguration = await getPathToGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath
                });

                if (absolutePathToGeneratorsConfiguration != null && result.updatedConfiguration != null) {
                    await writeFile(absolutePathToGeneratorsConfiguration, result.updatedConfiguration);
                }

                for (const upgrade of result.appliedUpgrades) {
                    const normalizedName = addDefaultDockerOrgIfNotPresent(upgrade.generatorName);
                    generators.push({
                        name: normalizedName,
                        group: upgrade.groupName,
                        api: workspace.workspaceName ?? null,
                        from: upgrade.previousVersion,
                        to: upgrade.newVersion,
                        changelog: getChangelogUrl(normalizedName),
                        migrationsApplied: upgrade.migrationsApplied ?? 0
                    });
                }

                for (const skip of result.skippedMajorUpgrades) {
                    const normalizedName = addDefaultDockerOrgIfNotPresent(skip.generatorName);
                    skippedMajor.push({
                        name: normalizedName,
                        current: skip.currentVersion,
                        latest: skip.latestMajorVersion
                    });
                }

                for (const upToDate of result.alreadyUpToDate) {
                    const normalizedName = addDefaultDockerOrgIfNotPresent(upToDate.generatorName);
                    alreadyUpToDate.push({
                        name: normalizedName,
                        version: upToDate.version
                    });
                }
            });
        })
    );

    // Sort arrays deterministically so output is stable across runs
    // (Promise.all over workspaces may resolve in any order)
    generators.sort((a, b) => {
        const key = (e: GeneratorUpgradeEntry): string => `${e.api ?? ""}::${e.group}::${e.name}`;
        return key(a).localeCompare(key(b));
    });
    skippedMajor.sort((a, b) => a.name.localeCompare(b.name));
    alreadyUpToDate.sort((a, b) => a.name.localeCompare(b.name));

    return { generators, skippedMajor, alreadyUpToDate };
}

// ---------------------------------------------------------------------------
// PR formatting helpers
// ---------------------------------------------------------------------------

/**
 * Strips the Docker org prefix from a generator name.
 * "fernapi/fern-typescript-sdk" → "typescript-sdk"
 */
export function getShortGeneratorName(name: string): string {
    return name.replace(/^fernapi\/fern-/, "");
}

/**
 * Builds a suggested PR title from the upgrade results.
 */
export function buildPrTitle({
    cli,
    generators
}: {
    cli: CliUpgradeResult;
    generators: readonly GeneratorUpgradeEntry[];
}): string {
    const parts: string[] = [];

    if (cli.upgraded) {
        parts.push(`CLI ${cli.from} → ${cli.to}`);
    }

    if (generators.length > 0) {
        parts.push(`${generators.length} generator${generators.length === 1 ? "" : "s"}`);
    }

    return `chore(fern): upgrade ${parts.join(" and ")}`;
}

/**
 * Builds a suggested PR body (markdown) from the upgrade results.
 */
export function buildPrBody({
    cli,
    generators
}: {
    cli: CliUpgradeResult;
    generators: readonly GeneratorUpgradeEntry[];
}): string {
    const sections: string[] = ["## Fern Upgrade\n"];

    if (cli.upgraded) {
        sections.push(`### CLI\n- \`${cli.from}\` → \`${cli.to}\`\n`);
    }

    if (generators.length > 0) {
        sections.push("### Generators");
        sections.push("| Generator | From | To | Changelog |");
        sections.push("|-----------|------|----|-----------|");

        for (const g of generators) {
            const link = g.changelog != null ? `[View](${g.changelog})` : "—";
            sections.push(`| ${g.name} | ${g.from} | ${g.to} | ${link} |`);
        }
        sections.push("");
    }

    sections.push(
        "---\n🤖 This PR was automatically created by " +
            "[fern-upgrade](https://github.com/fern-api/actions/tree/main/upgrade)"
    );

    return sections.join("\n");
}

/**
 * Builds a one-line commit message summarising all version changes.
 */
export function buildCommitMessage({
    cli,
    generators
}: {
    cli: CliUpgradeResult;
    generators: readonly GeneratorUpgradeEntry[];
}): string {
    const parts: string[] = [];

    if (cli.upgraded) {
        parts.push(`cli ${cli.from} -> ${cli.to}`);
    }

    for (const g of generators) {
        parts.push(`${getShortGeneratorName(g.name)} ${g.from} -> ${g.to}`);
    }

    return `chore: upgrade fern ${parts.join(", ")}`;
}

function buildPrSuggestion({
    cli,
    generators
}: {
    cli: CliUpgradeResult;
    generators: readonly GeneratorUpgradeEntry[];
}): PrSuggestion {
    return {
        title: buildPrTitle({ cli, generators }),
        body: buildPrBody({ cli, generators }),
        commitMessage: buildCommitMessage({ cli, generators })
    };
}
