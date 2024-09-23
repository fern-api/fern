import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { parseCliReleasesFile } from "../../utils/convertVersionsFileToReleases";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";

export async function generateCliChangelog({ context }: { context: TaskContext }): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();
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
            `Specified changelog location (${absolutePathToChangelogLocation}) not found, stopping changelog generation.`
        );
        return;
    }

    // Here we'll collect the changelogs so they're keyed by date, the map is essentially Release Date -> Version -> Changelog string
    const writtenVersions = new Map<Date, Map<string, string>>();
    // TODO: we might need to make an API call instead, to be able to have the date of the release filled in
    await parseCliReleasesFile({
        changelogPath: absolutePathToChangelogLocation,
        context,
        action: async (release) => {
            if (release.createdAt == null) {
                context.logger.error(
                    `Release ${release.version} does not have a createdAt value, skipping this release.`
                );
                return;
            }
            if (release.isYanked != null) {
                context.logger.error(`Release ${release.version} has been yanked, skipping this release.`);
                return;
            }

            const releaseDate = new Date(release.createdAt);
            if (!writtenVersions.has(releaseDate)) {
                writtenVersions.set(releaseDate, new Map());
            }

            const changelogString = `## ${release.version}\n`;
            if (release.changelogEntry == null) {
            }
            writtenVersions.get(releaseDate)!.set(release.version, release.changelog);
        }
    });
}
