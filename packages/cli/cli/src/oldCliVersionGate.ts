import boxen from "boxen";
import chalk from "chalk";
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

function isAnyAllowOldCliVersionArg(arg: string): boolean {
    return (
        arg === ALLOW_OLD_CLI_VERSION_FLAG ||
        arg.startsWith(`${ALLOW_OLD_CLI_VERSION_FLAG}=`) ||
        arg === `--no-${ALLOW_OLD_CLI_VERSION_FLAG.slice(2)}`
    );
}

export function withoutAllowOldCliVersionFlag(args: string[]): string[] {
    return args.filter((arg) => !isAnyAllowOldCliVersionArg(arg));
}

export function hasOldCliVersionConsent(args: string[]): boolean {
    return process.env[ALLOW_OLD_CLI_VERSION_ENV_VAR] === "true" || args.some(isAllowOldCliVersionArg);
}

/**
 * Older CLIs run npx from the project directory, so a project can replace the CLI or its tools with
 * its own executables. Warn loudly before running one; the flag or environment variable shortens the warning.
 */
export function warnAboutOldCliVersion({
    version,
    cliContext,
    args
}: {
    version: string;
    cliContext: CliContext;
    args: string[];
}): void {
    if (!isOlderThanMinimumIsolatedCliVersion(version)) {
        return;
    }
    const risk =
        `Fern CLI ${version} is older than ${MINIMUM_ISOLATED_CLI_VERSION} and runs npx from the project directory, ` +
        "so a package.json or node_modules/.bin in this project could run its own code in place of the CLI or its tools.";
    // Keep these on stderr: scripts capture stdout, e.g. `$(fern --version)`.
    if (hasOldCliVersionConsent(args)) {
        cliContext.stderr.warn(risk);
        return;
    }
    const message =
        `${chalk.bold.yellow(`Fern CLI ${version} is older than ${MINIMUM_ISOLATED_CLI_VERSION}`)}\n\n` +
        "It runs npx from the project directory, so a package.json or node_modules/.bin in this project " +
        "could run its own code in place of the CLI or its tools.\n\n" +
        `Run ${chalk.cyan("fern upgrade")} to update the version in fern.config.json.\n` +
        chalk.dim(
            `Set ${ALLOW_OLD_CLI_VERSION_ENV_VAR}=true or pass ${ALLOW_OLD_CLI_VERSION_FLAG} to shorten this warning.`
        );
    cliContext.stderr.warn(
        boxen(message, { padding: 1, margin: 1, borderStyle: "double", borderColor: "yellow", title: "WARNING" })
    );
}
