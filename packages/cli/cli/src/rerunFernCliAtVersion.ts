import execa from "execa";
import { CliEnvironment } from "./cli-context/CliEnvironment";

export async function rerunFernCliAtVersion({
    version,
    cliEnvironment,
}: {
    version: string;
    cliEnvironment: CliEnvironment;
}): Promise<void> {
    const npxProcess = execa(
        "npx",
        ["--quiet", "--yes", `${cliEnvironment.packageName}@${version}`, ...process.argv.slice(2)],
        {
            stdio: "inherit",
        }
    );
    npxProcess.stdout?.pipe(process.stdout);
    npxProcess.stderr?.pipe(process.stderr);
    await npxProcess;
}
