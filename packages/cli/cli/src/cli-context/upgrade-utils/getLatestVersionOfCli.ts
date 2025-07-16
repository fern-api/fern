import latestVersion from 'latest-version'

import { CliEnvironment } from '../CliEnvironment'

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment
    includePreReleases?: boolean
}): Promise<string> {
    // when running a non-prod version of the CLI (e.g. dev-cli in ETE tests),
    // don't try to upgrade
    if (cliEnvironment.packageName !== 'fern-api') {
        return cliEnvironment.packageVersion
    }
    return latestVersion(cliEnvironment.packageName, {
        version: includePreReleases ? 'prerelease' : 'latest'
    })
}
