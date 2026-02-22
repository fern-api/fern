import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";

import { CliContext } from "./cli-context/CliContext.js";
import { FERN_CWD_ENV_VAR } from "./cwd.js";
import { detectPackageManagerRunner } from "./utils/packageManagerRunner.js";

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
    throwOnError = false
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
    args?: string[];
    throwOnError?: boolean;
}): Promise<void> {
    cliContext.suppressUpgradeMessage();

    const runner = await detectPackageManagerRunner(cliContext.logger);
    if (runner == null) {
        const message =
            "No supported package manager runner found. " +
            "Please install one of: npm (npx), pnpm, yarn, bun, or deno.";
        if (throwOnError) {
            throw new RerunCliError({ version, stdout: "", stderr: message });
        }
        cliContext.failAndThrow(message);
        return;
    }

    const packageAtVersion = `${cliContext.environment.packageName}@${version}`;
    const commandLineArgs = runner.buildArgs(packageAtVersion, args ?? process.argv.slice(2));

    cliContext.logger.debug(
        [
            `Re-running CLI at version ${version} using ${runner.label}.`,
            `${chalk.dim(`+ ${runner.command} ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
        ].join("\n")
    );

    const { failed, stdout, stderr } = await loggingExeca(cliContext.logger, runner.command, commandLineArgs, {
        stdio: "inherit",
        reject: false,
        env: {
            ...env,
            [FERN_CWD_ENV_VAR]: process.env[FERN_CWD_ENV_VAR] ?? process.cwd(),
            FERN_NO_VERSION_REDIRECTION: "true"
        }
    });
    if (stdout.includes("code EEXIST") || stderr.includes("code EEXIST")) {
        // try again if there is an npx-style cache conflict
        return await rerunFernCliAtVersion({
            version,
            cliContext,
            env,
            args,
            throwOnError
        });
    }

    if (failed) {
        if (throwOnError) {
            throw new RerunCliError({ version, stdout, stderr });
        }
        cliContext.failWithoutThrowing();
    }
}
