import { CliError } from "@fern-api/task-context";
import { runWizard } from "@fern-api/wizard";
import latestVersion from "latest-version";

import { CliContext } from "../../cli-context/CliContext.js";
import { CliEnvironment } from "../../cli-context/CliEnvironment.js";
import { getLatestVersionOfCli } from "../../cli-context/upgrade-utils/getLatestVersionOfCli.js";

/** The version of an unreleased build of the CLI, which no release has. */
const UNRELEASED_VERSION = "0.0.0";

/**
 * `fern init` on its own in a terminal: the guided setup wizard (the same one `npx @fern-api/wizard`
 * runs), which sets up a Fern project, a docs site, coding-agent instructions, docs publishing, and SDKs.
 */
export async function runInitWizard({ cliContext }: { cliContext: CliContext }): Promise<void> {
    const exitCode = await runWizard({
        dir: process.cwd(),
        yes: false,
        dryRun: false,
        skipInstall: true,
        fernVersion: cliContext.environment.packageVersion,
        projectFernVersion: await getCliVersionForNewProject(cliContext.environment),
        // The wizard's own `fern` commands run this same CLI, and shouldn't switch to another version.
        fernCommand: { ...currentCliCommand(), env: { FERN_NO_VERSION_REDIRECTION: "true" } }
    });
    if (exitCode !== 0) {
        // The wizard has already explained what failed.
        cliContext.failWithoutThrowing(undefined, undefined, { code: CliError.Code.ConfigError });
    }
}

/**
 * The CLI version a new project pins in fern.config.json: the newest release. An unreleased build
 * (0.0.0) can't be installed, so `fern upgrade`, `fern generate`, and every other command would fail
 * in a project pinned to it. Falls back to `*` (whichever CLI is installed) when npm can't be reached.
 */
async function getCliVersionForNewProject(cliEnvironment: CliEnvironment): Promise<string> {
    try {
        return cliEnvironment.packageVersion === UNRELEASED_VERSION
            ? await latestVersion("fern-api")
            : await getLatestVersionOfCli({ cliEnvironment });
    } catch {
        // Offline or npm is unreachable; the project still works with any installed CLI.
        return cliEnvironment.packageVersion === UNRELEASED_VERSION ? "*" : cliEnvironment.packageVersion;
    }
}

/** How to run this same CLI again. */
function currentCliCommand(): { executable: string; args: string[] } {
    return cliCommandFor(process.execPath, process.argv[1]);
}

/** A packaged binary runs itself; a Node script runs through Node. */
export function cliCommandFor(execPath: string, script: string | undefined): { executable: string; args: string[] } {
    return script === undefined || script === execPath
        ? { executable: execPath, args: [] }
        : { executable: execPath, args: [script] };
}
