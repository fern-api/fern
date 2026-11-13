import { CliError } from "@fern-api/task-context";
import semver from "semver";

import { CliContext } from "./cli-context/CliContext.js";

/** First release whose version redirection and MDX bundling never run npx packages from the project. */
export const MINIMUM_ISOLATED_CLI_VERSION = "5.215.0";
export const ALLOW_OLD_CLI_VERSION_FLAG = "--allow-old-cli-version";
export const ALLOW_OLD_CLI_VERSION_ENV_VAR = "FERN_ALLOW_OLD_CLI_VERSION";

export function isOlderThanMinimumIsolatedCliVersion(version: string): boolean {
    return semver.valid(version) != null && semver.lt(version, MINIMUM_ISOLATED_CLI_VERSION);
}

function isAllowOldCliVersionArg(arg: string): boolean {
    return arg === ALLOW_OLD_CLI_VERSION_FLAG || arg === `${ALLOW_OLD_CLI_VERSION_FLAG}=true`;
}

export function withoutAllowOldCliVersionFlag(args: string[]): string[] {
    return args.filter((arg) => !isAllowOldCliVersionArg(arg));
}

/**
 * Older CLIs run npx from the project directory, so a project can replace the CLI or its tools with
 * its own executables. Running one requires the flag, the environment variable, or an interactive yes.
 */
export async function confirmOldCliVersionAllowed({
    version,
    cliContext,
    args
}: {
    version: string;
    cliContext: CliContext;
    args: string[];
}): Promise<void> {
    if (!isOlderThanMinimumIsolatedCliVersion(version)) {
        return;
    }
    const risk =
        `Fern CLI ${version} is older than ${MINIMUM_ISOLATED_CLI_VERSION} and runs npx from the project directory, ` +
        "so a package.json or node_modules/.bin in this project could run its own code in place of the CLI or its tools.";
    const isAllowed =
        process.env[ALLOW_OLD_CLI_VERSION_ENV_VAR] === "true" ||
        args.some(isAllowOldCliVersionArg) ||
        process.argv.slice(2).some(isAllowOldCliVersionArg);
    if (isAllowed) {
        cliContext.logger.warn(risk);
        return;
    }
    const resolution =
        `Run \`fern upgrade\` to update the version in fern.config.json, or pass ${ALLOW_OLD_CLI_VERSION_FLAG} ` +
        `(or set ${ALLOW_OLD_CLI_VERSION_ENV_VAR}=true) to run ${version} anyway if you trust this project.`;
    if (!cliContext.isInteractive) {
        return cliContext.failAndThrow(`${risk}\n${resolution}`, undefined, { code: CliError.Code.ConfigError });
    }
    cliContext.logger.warn(risk);
    const confirmed = await cliContext.confirmPrompt(`Run Fern CLI ${version} anyway?`, false);
    if (!confirmed) {
        return cliContext.failAndThrow(resolution, undefined, { code: CliError.Code.ConfigError });
    }
}
