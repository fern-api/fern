import chalk from "chalk";
import execa, { ExecaChildProcess } from "execa";
import { CliContext } from "./cli-context/CliContext";

export async function rerunFernCliAtVersion({
    version,
    cliContext,
    env,
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
}): Promise<ExecaChildProcess> {
    cliContext.suppressUpgradeMessage();

    const commandLineArgs = [
        "--quiet",
        "--yes",
        `${cliContext.environment.packageName}@${version}`,
        ...process.argv.slice(2),
    ];
    cliContext.logger.debug(
        [
            `Re-running CLI at version ${version}.`,
            `${chalk.dim(`+ npx ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`,
        ].join("\n")
    );

    const npxProcess = execa("npx", commandLineArgs, {
        stdio: "inherit",
        reject: false,
        env,
    });
    npxProcess.stdout?.pipe(process.stdout);
    npxProcess.stderr?.pipe(process.stderr);
    return npxProcess;
}
