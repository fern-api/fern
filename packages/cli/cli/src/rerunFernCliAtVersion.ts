import execa, { ExecaChildProcess } from "execa";
import { CliEnvironment } from "./cli-context/CliEnvironment";

export async function rerunFernCliAtVersion({
    version,
    cliEnvironment,
    env,
}: {
    version: string;
    cliEnvironment: CliEnvironment;
    env?: Record<string, string>;
}): Promise<ExecaChildProcess> {
    const npxProcess = execa(
        "npx",
        ["--quiet", "--yes", `${cliEnvironment.packageName}@${version}`, ...process.argv.slice(2)],
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
