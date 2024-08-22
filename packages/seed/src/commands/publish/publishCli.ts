import { TaskContext } from "@fern-api/task-context";
import { CliReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";
import semver from "semver";
import { PublishCommand } from "../../config/api";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";
import { parseCliReleasesFile } from "../../utils/convertVersionsFileToReleases";
import { runCommands, subVersion } from "../../utils/publishUtilities";

interface VersionFilePair {
    latestChangelogPath: string;
    previousChangelogPath: string;
}

export async function publishCli({
    version,
    context
}: {
    version: string | VersionFilePair;
    context: TaskContext;
}): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();
    context.logger.info(`Publishing CLI@${version}...`);

    let publishVersion: string;
    if (typeof version !== "string") {
        // We were given two version files, so we need to compare them to find if any new
        // versions have been added since the last publish.
        const maybeNewVersion = await getNewVersion({
            versionFilePair: version,
            context
        });

        if (maybeNewVersion == null) {
            context.failWithoutThrowing(
                "No version to publish! There must not have been a new version since the last publish."
            );
            return;
        }
        publishVersion = maybeNewVersion;
    } else {
        publishVersion = version;
    }

    let publishConfig: PublishCommand;
    if (publishVersion.includes("rc")) {
        publishConfig = cliWorkspace.workspaceConfig.publishRc;
    } else {
        publishConfig = cliWorkspace.workspaceConfig.publishGa;
    }

    // Instance of PublishCommand configuration, leverage these commands outright
    const unparsedCommands = publishConfig.command;
    const commands = Array.isArray(unparsedCommands) ? unparsedCommands : [unparsedCommands];
    const versionSubsitution = publishConfig.versionSubstitution;
    const subbedCommands = commands.map((command) => subVersion(command, publishVersion, versionSubsitution));
    await runCommands(subbedCommands, context, cliWorkspace.absolutePathToWorkspace);
}

// This function is just different enough from the equivalent in publishGenerator.ts that it's worth keeping them separate
//
// Take two files, traditionally the latest version file (e.g. the file on the branch merging to main),
// and the previous version file (e.g. the file on the main branch), and compare them to find the most recent version
//
// The most recent version is defined here as the most recent version in the latest version file that is not in the previous version file
export async function getNewVersion({
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
