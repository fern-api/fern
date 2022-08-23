import execa, { ExecaChildProcess } from "execa";
import { CliEnvironment } from "./cli-context/CliEnvironment";

export async function rerunFernCliAtVersion({
    version,
    cliEnvironment,
}: {
    version: string;
    cliEnvironment: CliEnvironment;
}): Promise<ExecaChildProcess> {
    const npxProcess = execa(
        "npx",
        ["--quiet", "--yes", `${cliEnvironment.packageName}@${version}`, ...process.argv.slice(2)],
        {
            stdio: "inherit",
            reject: false,
        }
    );
    npxProcess.stdout?.pipe(process.stdout);
    npxProcess.stderr?.pipe(process.stderr);
    return npxProcess;
}
