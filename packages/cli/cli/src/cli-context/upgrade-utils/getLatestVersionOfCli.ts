import latestVersion from "latest-version";

import { CliEnvironment } from "../CliEnvironment.js";

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment;
    includePreReleases?: boolean;
}): Promise<string> {
    // when running a non-prod version of the CLI (e.g. dev-cli in ETE tests),
    // or a local dev build (version 0.0.0), don't try to upgrade
    if (cliEnvironment.packageName !== "fern-api" || cliEnvironment.packageVersion === "0.0.0") {
        return cliEnvironment.packageVersion;
    }
    return latestVersion(cliEnvironment.packageName, {
        version: includePreReleases ? "prerelease" : "latest"
    });
}
