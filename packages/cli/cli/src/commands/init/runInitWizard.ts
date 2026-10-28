import { CliError } from "@fern-api/task-context";
import { runWizard } from "@fern-api/wizard";

import { CliContext } from "../../cli-context/CliContext.js";

/**
 * `fern init` on its own in a terminal: the guided setup wizard (the same one `npx @fern-api/wizard`
 * runs), which sets up a Fern project, a docs site, coding-agent instructions, docs publishing, and SDKs.
 */
export async function runInitWizard({ cliContext }: { cliContext: CliContext }): Promise<void> {
    // The wizard's own `fern` commands run this same CLI, and shouldn't switch to another version.
    process.env.FERN_NO_VERSION_REDIRECTION = "true";
    const exitCode = await runWizard({
        dir: process.cwd(),
        yes: false,
        dryRun: false,
        skipInstall: true,
        fernVersion: cliContext.environment.packageVersion,
        fernCommand: currentCliCommand()
    });
    if (exitCode !== 0) {
        // The wizard has already explained what failed.
        cliContext.failWithoutThrowing(undefined, undefined, { code: CliError.Code.ConfigError });
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
