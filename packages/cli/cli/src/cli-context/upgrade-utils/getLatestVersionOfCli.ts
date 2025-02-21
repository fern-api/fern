import latestVersion from "latest-version";

import { CliEnvironment } from "../CliEnvironment";

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment;
    includePreReleases?: boolean;
}): Promise<string> {
    return latestVersion("fern-api", {
        version: includePreReleases ? "prerelease" : "latest"
    });
}
