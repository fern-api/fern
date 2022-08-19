import latestVersion from "latest-version";
import { CliEnvironment } from "../readCliEnvironment";

export async function getLatestVersionOfCli(cliEnvironment: CliEnvironment): Promise<string> {
    return latestVersion(cliEnvironment.packageName);
}
