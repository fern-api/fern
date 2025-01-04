import chalk from "chalk";

import { loggingExeca } from "@fern-api/logging-execa";

import { CliContext } from "./cli-context/CliContext";
import { FERN_CWD_ENV_VAR } from "./cwd";

export async function rerunFernCliAtVersion({
    version,
    cliContext,
    env
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
}): Promise<void> {
    cliContext.suppressUpgradeMessage();

    const commandLineArgs = [
        "--quiet",
        "--yes",
        `${cliContext.environment.packageName}@${version}`,
        ...process.argv.slice(2)
    ];
    cliContext.logger.debug(
        [
            `Re-running CLI at version ${version}.`,
            `${chalk.dim(`+ npx ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
        ].join("\n")
    );

    const { failed, stdout, stderr } = await loggingExeca(cliContext.logger, "npx", ["--quiet", ...commandLineArgs], {
        stdio: "inherit",
        reject: false,
        env: {
            ...env,
            [FERN_CWD_ENV_VAR]: process.env[FERN_CWD_ENV_VAR] ?? process.cwd()
        }
    });
    if (stdout?.includes("code EEXIST") || stderr?.includes("code EEXIST")) {
        // try again if there is a npx conflict
        return await rerunFernCliAtVersion({
            version,
            cliContext
        });
    }

    if (failed) {
        cliContext.failWithoutThrowing();
    }
}
