import { loggingExeca } from "@fern-api/logging-execa";
import { TaskAbortSignal } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { CliContext } from "./cli-context/CliContext.js";
import { FERN_CWD_ENV_VAR } from "./cwd.js";

export class RerunCliError extends Error {
    public readonly stdout: string;
    public readonly stderr: string;
    public readonly version: string;

    constructor({ version, stdout, stderr }: { version: string; stdout: string; stderr: string }) {
        super(`Failed to rerun CLI at version ${version}`);
        this.name = "RerunCliError";
        this.version = version;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}

export async function rerunFernCliAtVersion({
    version,
    cliContext,
    env,
    args,
    cwd = process.env[FERN_CWD_ENV_VAR] ?? process.cwd(),
    throwOnError = false
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
    args?: string[];
    cwd?: string;
    throwOnError?: boolean;
}): Promise<void> {
    cliContext.suppressUpgradeMessage();

    const commandLineArgs = [
        "--quiet",
        "--yes",
        "--package",
        `${cliContext.environment.packageName}@${version}`,
        "--",
        // Local builds display "fern-local" but redirect to the published fern-api package.
        cliContext.environment.packageName === "fern-api" ? "fern" : cliContext.environment.cliName,
        ...(args ?? process.argv.slice(2))
    ];
    cliContext.logger.debug(
        [
            `Re-running CLI at version ${version}.`,
            `${chalk.dim(`+ npx ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
        ].join("\n")
    );

    // Run npx from an isolated directory, not the user's project, so it can't resolve the CLI
    // from files in the project. The child changes back to the user's directory via FERN_CWD.
    const npxDirectory = await mkdtemp(path.join(os.tmpdir(), "fern-cli-"));
    let result: loggingExeca.ReturnValue;
    try {
        // A temp directory may be inside a project; establish an independent npm prefix.
        await writeFile(path.join(npxDirectory, "package.json"), JSON.stringify({ private: true }));
        // Explicit --package also skips npx's binary search through ancestor directories.
        result = await loggingExeca(cliContext.logger, "npx", commandLineArgs, {
            cwd: npxDirectory,
            stdio: "inherit",
            reject: false,
            env: {
                ...env,
                [FERN_CWD_ENV_VAR]: cwd,
                FERN_NO_VERSION_REDIRECTION: "true"
            }
        });
    } finally {
        await rm(npxDirectory, { recursive: true, force: true });
    }
    const { failed, stdout, stderr } = result;
    if (stdout.includes("code EEXIST") || stderr.includes("code EEXIST")) {
        // try again if there is a npx conflict
        return await rerunFernCliAtVersion({
            version,
            cliContext,
            env,
            args,
            cwd,
            throwOnError
        });
    }

    if (failed) {
        if (throwOnError) {
            throw new RerunCliError({ version, stdout, stderr });
        }
        // We don't want to report this as an error to Sentry or PostHog, so we throw a TaskAbortSignal.
        cliContext.failWithoutThrowing(undefined, new TaskAbortSignal());
    }
}
