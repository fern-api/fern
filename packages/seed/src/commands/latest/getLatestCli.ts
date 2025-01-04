import semver from "semver";

import { RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";
import { parseCliReleasesFile } from "../../utils/convertVersionsFileToReleases";
import { VersionFilePair, getNewCliVersion } from "../../utils/versionUtilities";

export async function getLatestCli({
    context,
    maybeChangelogs
}: {
    context: TaskContext;
    maybeChangelogs: VersionFilePair | undefined;
}): Promise<string | undefined> {
    const cliWorkspace = await loadCliWorkspace();
    if (maybeChangelogs != null) {
        // We were given two version files, so we need to compare them to find if any new
        // versions have been added since the last publish.
        const maybeNewVersion = await getNewCliVersion({
            versionFilePair: maybeChangelogs,
            context
        });

        if (maybeNewVersion == null) {
            context.failWithoutThrowing(
                "No version diff! There must not have been a new version since the last publish."
            );
            return;
        }
        return maybeNewVersion;
    }

    if (cliWorkspace == null) {
        context.logger.error("Failed to find CLI workspace, no latest version found.");
        return;
    }
    if (cliWorkspace.workspaceConfig.changelogLocation == null) {
        context.logger.error(
            "No changelog location specified, unable to determine latest version. To register CLI releases, specify a changelog location at: `changelogLocation`."
        );
        return;
    }
    const absolutePathToChangelogLocation = join(
        cliWorkspace.absolutePathToWorkspace,
        RelativeFilePath.of(cliWorkspace.workspaceConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelogLocation))) {
        context.logger.error(
            `Specified changelog location (${absolutePathToChangelogLocation}) not found, continuing without getting the latest version.`
        );
        return undefined;
    }

    let latestVersion: string | undefined;
    await parseCliReleasesFile({
        changelogPath: absolutePathToChangelogLocation,
        context,
        action: async (release) => {
            const maybeNewSemver = semver.parse(release.version);
            const maybeCurrentSemver = semver.parse(latestVersion);
            if (
                latestVersion == null ||
                (maybeCurrentSemver != null && maybeNewSemver != null && maybeNewSemver.compare(maybeCurrentSemver) > 0)
            ) {
                latestVersion = release.version;
            }
        }
    });

    return latestVersion;
}
