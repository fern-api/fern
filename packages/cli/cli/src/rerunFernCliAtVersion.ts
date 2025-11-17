import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";

import { CliContext } from "./cli-context/CliContext";
import { FERN_CWD_ENV_VAR } from "./cwd";

export async function rerunFernCliAtVersion({
    version,
    cliContext,
    env,
    args
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
    args?: string[];
}): Promise<void> {
    cliContext.suppressUpgradeMessage();

    const commandLineArgs = [
        "--quiet",
        "--yes",
        `${cliContext.environment.packageName}@${version}`,
        ...(args ?? process.argv.slice(2))
    ];
    cliContext.logger.debug(
        [
            `Re-running CLI at version ${version}.`,
            `${chalk.dim(`+ npx ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
        ].join("\n")
    );

    const { failed, stdout, stderr } = await loggingExeca(cliContext.logger, "npx", commandLineArgs, {
        stdio: "inherit",
        reject: false,
        env: {
            ...env,
            [FERN_CWD_ENV_VAR]: process.env[FERN_CWD_ENV_VAR] ?? process.cwd(),
            FERN_NO_VERSION_REDIRECTION: "true"
        }
    });
    if (stdout.includes("code EEXIST") || stderr.includes("code EEXIST")) {
        // try again if there is a npx conflict
        return await rerunFernCliAtVersion({
            version,
            cliContext,
            env,
            args
        });
    }

    if (failed) {
        cliContext.failWithoutThrowing();
    }
}
