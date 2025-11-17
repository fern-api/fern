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

async function validateTargetVersion({
    cliContext,
    targetVersion,
    currentVersion
}: {
    cliContext: CliContext;
    targetVersion: string;
    currentVersion: string;
}): Promise<void> {
    const versionExists = await doesVersionOfCliExist({
        cliEnvironment: cliContext.environment,
        version: targetVersion
    });
    if (!versionExists) {
        return cliContext.failAndThrow(
            `Failed to upgrade to ${targetVersion} because it does not exist. See https://www.npmjs.com/package/${cliContext.environment.packageName}?activeTab=versions.`
        );
    }

    const versionAhead = isVersionAhead(targetVersion, currentVersion);
    if (!versionAhead) {
        return cliContext.failAndThrow(
            `Cannot upgrade because target version (${targetVersion}) is not ahead of existing version ${currentVersion}`
        );
    }
}

async function ensureRunningAtTargetVersionForManualUpgrade({
    cliContext,
    fromVersion,
    targetVersion
}: {
    cliContext: CliContext;
    fromVersion: string;
    targetVersion: string;
}): Promise<void> {
    await validateTargetVersion({
        cliContext,
        targetVersion,
        currentVersion: cliContext.environment.packageVersion
    });

    cliContext.logger.info(
        `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(targetVersion)}`
    );

    await loggingExeca(cliContext.logger, "npm", [
        "install",
        "-g",
        `${cliContext.environment.packageName}@${targetVersion}`
    ]);

    cliContext.logger.info(
        `Re-running CLI at ${chalk.green(targetVersion)} with --from ${chalk.dim(fromVersion)} --to ${chalk.green(targetVersion)}`
    );

    await rerunFernCliAtVersion({
        version: targetVersion,
        cliContext,
        env: {
            [PREVIOUS_VERSION_ENV_VAR]: fromVersion
        },
        args: ["upgrade", "--from", fromVersion, "--to", targetVersion]
    });
}

/**
 * Handles CLI upgrades and migrations between versions.
 *
 * There are 3 relevant versions:
 *   1. the version of the CLI specified in fern.config.json
 *   2. the version of the CLI being run right now
 *   3. the version of the CLI we're upgrading to (can be passed in via --to/--version,
 *      or defaults to the latest published version)
 *
 * When the CLI is first invoked, if the version of the CLI is not equal to
 * the version in fern.config.json, we immediately re-run the CLI at the
 * version specified in fern.config.json. So by the time we're here, we can
 * assume that version #1 == version #2.
 *
 * If #3 is the same version as #1 and #2 (i.e. we're already at the target version),
 * then this function simply prints "No upgrade available." and returns.
 *
 * Otherwise, if an upgrade is available, this function:
 *   1. Upgrades the globally-installed version of the CLI to the target version
 *   2. Re-runs `fern upgrade` at the target version with explicit --from and --to flags
 *      (also sets PREVIOUS_VERSION_ENV_VAR for backwards compatibility)
 *   3. During this re-run, migrations are executed from the previous version to the target
 *   4. After migrations complete successfully, fern.config.json is updated to the target version
 *
 * Manual upgrade mode (--from and --to flags):
 *   - If both flags are provided and the current CLI is not at the target version,
 *     the CLI installs the target version globally and re-runs at that version
 *   - This ensures migrations run using the target CLI's code, not the current CLI's code
 *   - If already at the target version, migrations run directly and config is updated after
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

        // If user manually specified --from and --to, ensure we're running at the target version
        if (
            fromVersionTrimmed &&
            targetVersionTrimmed &&
            cliContext.environment.packageVersion !== targetVersionForMigration
        ) {
            await ensureRunningAtTargetVersionForManualUpgrade({
                cliContext,
                fromVersion: resolvedFrom,
                targetVersion: targetVersionForMigration
            });
            return;
        }

        cliContext.logger.info(
            `Running migrations from ${chalk.dim(resolvedFrom)} → ${chalk.green(targetVersionForMigration)}`
        );
        await runPostUpgradeSteps({
            cliContext,
            previousVersion: resolvedFrom,
            newVersion: targetVersionForMigration
        });

        if (hasExplicitTo || (previousEnvVar && isPublishedCli)) {
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
        await validateTargetVersion({
            cliContext,
            targetVersion: targetVersionTrimmed,
            currentVersion: cliContext.environment.packageVersion
        });
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

        const previousVersionBeforeUpgrade = projectConfig.version;
        const isLocalDev = cliContext.environment.packageVersion === "0.0.0";

        cliContext.logger.info(
            `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(
                fernCliUpgradeInfo.targetVersion
            )}`
        );

        cliContext.environment.packageVersion = fernCliUpgradeInfo.targetVersion;
        if (isLocalDev) {
            await runPostUpgradeSteps({
                cliContext,
                previousVersion: previousVersionBeforeUpgrade,
                newVersion: fernCliUpgradeInfo.targetVersion
            });
            const newProjectConfig = produce(projectConfig.rawConfig, (draft) => {
                draft.version = fernCliUpgradeInfo.targetVersion;
            });
            await writeFile(
                projectConfig._absolutePath,
                ensureFinalNewline(JSON.stringify(newProjectConfig, undefined, 2))
            );
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
                },
                args: ["upgrade", "--from", previousVersionBeforeUpgrade, "--to", fernCliUpgradeInfo.targetVersion]
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
