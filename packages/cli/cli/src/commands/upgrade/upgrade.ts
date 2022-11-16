import { loggingExeca } from "@fern-api/logging-execa";
import { runMigrations } from "@fern-api/migrations";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import { loadProject } from "@fern-api/project-loader";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import produce from "immer";
import { CliContext } from "../../cli-context/CliContext";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";
import { upgradeGeneratorsInWorkspaces } from "./upgradeGeneratorsInWorkspaces";

const PREVIOUS_VERSION_ENV_VAR = "FERN_PRE_UPGRADE_VERSION";

/**
 * there are 3 relevant versions:
 *   1. the version of the CLI specified in fern.config.json
 *   2. the version of the CLI being run right now.
 *   3. the latest version of the CLI that's been released.
 *
 * When the CLI is first invoked, if the version of the CLI is not equal to
 * the version in fern.config.json, we immediately re-run the CLI at the
 * version specified in fern.config.json. So by the time we're here, we can
 * assume that version #1 == version #2.
 *
 * if #3 is the same version as #1 and #2 (i.e. no later version of the CLI exists),
 * then this function simply prints "No upgrade available." and returns.
 *
 * otherwise, if an upgrade is available, this function:
 *   1. upgrades the globally-installed version of the CLI to the latest version
 *   2. change the version in fern.config.json to the latest version
 *   3. re-runs `fern upgrade` using the latest version the CLI
 *        implementation detail: when doing so, we set the PREVIOUS_VERSION_ENV_VAR
 *        so we know what version we just upgraded from
 *   4. During this re-run, this function is invoked again. During this re-run, we:
 *        - run any migrations between PREVIOUS_VERSION_ENV_VAR and the latest version of the CLI.
 *        - change the generator versions in generators.yml to the latest stable versions
 */
export async function upgrade({ cliContext }: { cliContext: CliContext }): Promise<void> {
    const fernCliUpgradeInfo = await cliContext.isUpgradeAvailable();
    if (!fernCliUpgradeInfo.isUpgradeAvailable) {
        const previousVersion = process.env[PREVIOUS_VERSION_ENV_VAR];
        if (previousVersion == null) {
            cliContext.logger.info("No upgrade available.");
            return;
        }

        await cliContext.runTask(async (context) => {
            await runMigrations({
                fromVersion: previousVersion,
                toVersion: fernCliUpgradeInfo.latestVersion,
                context,
            });
        });
        await cliContext.exitIfFailed();

        const contextForLoadingProject = cliContext.addTask().start();
        const project = await loadProject({
            commandLineWorkspace: undefined,
            defaultToAllWorkspaces: true,
            cliName: cliContext.environment.cliName,
            context: contextForLoadingProject,
        });
        contextForLoadingProject.finish();
        await upgradeGeneratorsInWorkspaces(project, cliContext);
    } else {
        const fernDirectory = await getFernDirectory();
        if (fernDirectory == null) {
            cliContext.fail(`Directory "${FERN_DIRECTORY}" not found.`);
            return;
        }
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );
        const newProjectConfig = produce(projectConfig.rawConfig, (draft) => {
            draft.version = fernCliUpgradeInfo.latestVersion;
        });
        await writeFile(projectConfig._absolutePath, JSON.stringify(newProjectConfig, undefined, 2));

        cliContext.logger.info(
            `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(
                fernCliUpgradeInfo.latestVersion
            )}`
        );

        await loggingExeca(cliContext.logger, "npm", ["install", "-g", cliContext.environment.packageName]);

        const { failed } = await rerunFernCliAtVersion({
            version: fernCliUpgradeInfo.latestVersion,
            cliContext,
            env: {
                [PREVIOUS_VERSION_ENV_VAR]: cliContext.environment.packageVersion,
            },
        });
        if (failed) {
            cliContext.fail();
        }
    }
}
