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

    const npxProcess = execa(
        "npx",
        ["--quiet", "--yes", `${cliContext.environment.packageName}@${version}`, ...process.argv.slice(2)],
        {
            stdio: "inherit",
            reject: false,
            env,
        }
    );
    npxProcess.stdout?.pipe(process.stdout);
    npxProcess.stderr?.pipe(process.stderr);
    return npxProcess;
}
