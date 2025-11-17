import { runMigrations } from "@fern-api/cli-migrations";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { loggingExeca } from "@fern-api/logging-execa";
import { isVersionAhead } from "@fern-api/semver-utils";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { produce } from "immer";

import { CliContext } from "../../cli-context/CliContext";
import { doesVersionOfCliExist } from "../../cli-context/upgrade-utils/doesVersionOfCliExist";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";

export const PREVIOUS_VERSION_ENV_VAR = "FERN_PRE_UPGRADE_VERSION";

function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}

async function getProjectConfigVersionSafe(cliContext: CliContext): Promise<string | undefined> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return undefined;
    }
    try {
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );
        return projectConfig.version;
    } catch {
        return undefined;
    }
}

/**
 * there are 3 relevant versions:
 *   1. the version of the CLI specified in fern.config.json
 *   2. the version of the CLI being run right now.
 *   3. the version of the CLI we're upgrading to (can be passed in, but default
 *      to the latest published version)
 *
 * When the CLI is first invoked, if the version of the CLI is not equal to
 * the version in fern.config.json, we immediately re-run the CLI at the
 * version specified in fern.config.json. So by the time we're here, we can
 * assume that version #1 == version #2.
 *
 * if #3 is the same version as #1 and #2 (i.e. we're already at the target version),
 * then this function simply prints "No upgrade available." and returns.
 *
 * otherwise, if an upgrade is available, this function:
 *   1. upgrades the globally-installed version of the CLI to the target version
 *   2. change the version in fern.config.json to the target version
 *   3. re-runs `fern upgrade` using the latest version the CLI
 *        implementation detail: when doing so, we set the PREVIOUS_VERSION_ENV_VAR
 *        so we know what version we just upgraded from
 *   4. During this re-run, this function is invoked again. During this re-run,
 *      we run any migrations between PREVIOUS_VERSION_ENV_VAR and the target
 *      version of the CLI.
 */
export async function upgrade({
    cliContext,
    includePreReleases,
    targetVersion,
    fromVersion
}: {
    cliContext: CliContext;
    includePreReleases: boolean;
    targetVersion: string | undefined;
    fromVersion: string | undefined;
}): Promise<void> {
    const previousEnvVar = process.env[PREVIOUS_VERSION_ENV_VAR]?.trim() || undefined;
    const fromVersionTrimmed = fromVersion?.trim() || undefined;
    const targetVersionTrimmed = targetVersion?.trim() || undefined;
    const hasExplicitTo = targetVersionTrimmed != null;
    const isPublishedCli = cliContext.environment.packageVersion !== "0.0.0";
    const inMigrationMode = (fromVersionTrimmed || previousEnvVar) && (isPublishedCli || targetVersionTrimmed);

    if (inMigrationMode) {
        const resolvedFrom = fromVersionTrimmed ?? previousEnvVar ?? "";

        let targetVersionForMigration =
            targetVersionTrimmed ?? (await getProjectConfigVersionSafe(cliContext)) ?? undefined;

        if (!targetVersionForMigration || targetVersionForMigration === "0.0.0") {
            const currentVersion = cliContext.environment.packageVersion;
            if (currentVersion && currentVersion !== "0.0.0") {
                targetVersionForMigration = currentVersion;
            } else {
                return cliContext.failAndThrow(
                    "Could not determine target version. Provide --to/--version flag or ensure fern.config.json pins a valid version."
                );
            }
        }

        cliContext.logger.info(
            `Running migrations from ${chalk.dim(resolvedFrom)} → ${chalk.green(targetVersionForMigration)}`
        );
        await runPostUpgradeSteps({
            cliContext,
            previousVersion: resolvedFrom,
            newVersion: targetVersionForMigration
        });

        // If explicit target version was provided, update fern.config.json
        if (hasExplicitTo) {
            const fernDirectory = await getFernDirectory();
            if (fernDirectory != null) {
                const projectConfig = await cliContext.runTask((context) =>
                    loadProjectConfig({ directory: fernDirectory, context })
                );
                const newProjectConfig = produce(projectConfig.rawConfig, (draft) => {
                    draft.version = targetVersionForMigration;
                });
                await writeFile(
                    projectConfig._absolutePath,
                    ensureFinalNewline(JSON.stringify(newProjectConfig, undefined, 2))
                );
                cliContext.logger.info(`Updated fern.config.json to version ${chalk.green(targetVersionForMigration)}`);
            }
        }

        return;
    }

    if (targetVersionTrimmed) {
        const versionExists = await doesVersionOfCliExist({
            cliEnvironment: cliContext.environment,
            version: targetVersionTrimmed
        });
        if (!versionExists) {
            cliContext.failAndThrow(
                `Failed to upgrade to ${targetVersionTrimmed} because it does not exist. See https://www.npmjs.com/package/${cliContext.environment.packageName}?activeTab=versions.`
            );
        }

        const versionAhead = isVersionAhead(targetVersionTrimmed, cliContext.environment.packageVersion);
        if (!versionAhead) {
            cliContext.failAndThrow(
                `Cannot upgrade because target version (${targetVersionTrimmed}) is not ahead of existing version ${cliContext.environment.packageVersion}`
            );
        }
    }

    let fernCliUpgradeInfo = targetVersionTrimmed
        ? { targetVersion: targetVersionTrimmed, isUpgradeAvailable: true }
        : undefined;
    if (fernCliUpgradeInfo == null) {
        const fernUpgradeInfo = await cliContext.isUpgradeAvailable({
            includePreReleases
        });
        if (fernUpgradeInfo.cliUpgradeInfo != null) {
            fernCliUpgradeInfo = {
                targetVersion: fernUpgradeInfo.cliUpgradeInfo.latestVersion,
                isUpgradeAvailable: fernUpgradeInfo.cliUpgradeInfo.isUpgradeAvailable
            };
        }
    }

    if (fernCliUpgradeInfo && !fernCliUpgradeInfo.isUpgradeAvailable) {
        cliContext.logger.info("No upgrade available.");
        return;
    } else if (fernCliUpgradeInfo != null) {
        const fernDirectory = await getFernDirectory();
        if (fernDirectory == null) {
            return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
        }
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );

        const newProjectConfig = produce(projectConfig.rawConfig, (draft) => {
            draft.version = fernCliUpgradeInfo.targetVersion;
        });
        await writeFile(
            projectConfig._absolutePath,
            ensureFinalNewline(JSON.stringify(newProjectConfig, undefined, 2))
        );

        const previousVersionBeforeUpgrade = projectConfig.version;

        cliContext.logger.info(
            `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(
                fernCliUpgradeInfo.targetVersion
            )}`
        );

        cliContext.environment.packageVersion = fernCliUpgradeInfo.targetVersion;
        // special case: if we're running the local-dev version of the CLI, simulate a re-run
        if (cliContext.environment.packageVersion === "0.0.0") {
            await runPostUpgradeSteps({
                cliContext,
                previousVersion: previousVersionBeforeUpgrade,
                newVersion: fernCliUpgradeInfo.targetVersion
            });
        } else {
            await loggingExeca(cliContext.logger, "npm", [
                "install",
                "-g",
                `${cliContext.environment.packageName}@${fernCliUpgradeInfo.targetVersion}`
            ]);

            await rerunFernCliAtVersion({
                version: fernCliUpgradeInfo.targetVersion,
                cliContext,
                env: {
                    [PREVIOUS_VERSION_ENV_VAR]: previousVersionBeforeUpgrade
                }
            });
        }
    }
}

async function runPostUpgradeSteps({
    cliContext,
    previousVersion,
    newVersion
}: {
    cliContext: CliContext;
    previousVersion: string;
    newVersion: string;
}) {
    await cliContext.runTask(async (context) => {
        await runMigrations({
            fromVersion: previousVersion,
            toVersion: newVersion,
            context
        });
    });
    await cliContext.exitIfFailed();
}
