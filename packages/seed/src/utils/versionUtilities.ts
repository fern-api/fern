import semver from "semver";

import { TaskContext } from "@fern-api/task-context";

import { CliReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";

import { parseCliReleasesFile } from "./convertVersionsFileToReleases";

export interface VersionFilePair {
    latestChangelogPath: string;
    previousChangelogPath: string;
}

// This function is just different enough from the equivalent in publishGenerator.ts that it's worth keeping them separate
//
// Take two files, traditionally the latest version file (e.g. the file on the branch merging to main),
// and the previous version file (e.g. the file on the main branch), and compare them to find the most recent version
//
// The most recent version is defined here as the most recent version in the latest version file that is not in the previous version file
export async function getNewCliVersion({
    versionFilePair,
    context
}: {
    versionFilePair: VersionFilePair;
    context: TaskContext;
}): Promise<string | undefined> {
    // Our action performed on each generator release in the file is to
    // simply collect the version ID within a set for comparison later
    const collectVersions = (versionsSet: Set<string>) => {
        return async (release: CliReleaseRequest) => {
            versionsSet.add(release.version);
        };
    };

    const latestVersionGeneratorReleasesVersions = new Set<string>();
    await parseCliReleasesFile({
        changelogPath: versionFilePair.latestChangelogPath,
        context,
        action: collectVersions(latestVersionGeneratorReleasesVersions)
    });
    const previousVersionGeneratorReleaseVersions = new Set<string>();
    await parseCliReleasesFile({
        changelogPath: versionFilePair.previousChangelogPath,
        context,
        action: collectVersions(previousVersionGeneratorReleaseVersions)
    });

    // Get generator versions not in the previous version file
    //
    // Sadly TS does not have a set difference function, so we manually filter the "latest"
    // array for versions explicitly not in the previous versions set
    const newVersions = Array.from(latestVersionGeneratorReleasesVersions).filter(
        (item) => !previousVersionGeneratorReleaseVersions.has(item)
    );

    // Sort the resultant array of new versions by semantic version and return the largest / "most recent"
    return (
        newVersions
            .map((ver) => semver.parse(ver))
            .filter((ver): ver is semver.SemVer => ver != null)
            // Here we compare semantic versions to try to get the largest version that's new
            // We negate the number to get the largest version first
            .sort((a, b) => -a.compare(b))[0]
            ?.toString()
    );
}
