import execa from "execa";
import { hideBin } from "yargs/helpers";
import { CliEnvironment } from "./readCliEnvironment";

export async function rerunFernCliAtVersion({
    version,
    cliEnvironment,
}: {
    version: string;
    cliEnvironment: CliEnvironment;
}): Promise<void> {
    const npxProcess = execa("npx", [`${cliEnvironment.packageName}@${version}`, ...hideBin(process.argv)], {
        stdio: "inherit",
    });
    npxProcess.stdout?.pipe(process.stdout);
    npxProcess.stderr?.pipe(process.stderr);
    await npxProcess;
}
