import latestVersion from "latest-version";

import { CliEnvironment } from "../CliEnvironment";

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment;
    includePreReleases?: boolean;
}): Promise<string> {
    // when running a non-published version of the CLI (e.g. in ETE tests),
    // don't try to upgrade
    if (cliEnvironment.packageVersion === "0.0.0") {
        return cliEnvironment.packageVersion;
    }
    return latestVersion(cliEnvironment.packageName, {
        version: includePreReleases ? "prerelease" : "latest"
    });
}
