import { doesPathExist, join, RelativeFilePath, AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { writeChangelogEntries } from "./writeChangelogEntries";
import { parseCliReleasesFile } from "../../utils/convertVersionsFileToReleases";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";
import { mkdir, writeFile } from "fs/promises";
import { format } from "date-fns";

export async function generateCliChangelog({
    context,
    outputPath
}: {
    context: TaskContext;
    outputPath: string | undefined;
}): Promise<void> {
    const resolvedOutputPath =
        outputPath == null
            ? AbsoluteFilePath.of(process.cwd())
            : outputPath.startsWith("/")
            ? AbsoluteFilePath.of(outputPath)
            : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(outputPath));
    await mkdir(resolvedOutputPath, { recursive: true });

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

            writtenVersions
                .get(releaseDate)!
                .set(release.version, writeChangelogEntries(release.version, release.changelogEntry));
        }
    });

    // Now we'll write the changelogs to their files
    for (const [releaseDate, versions] of writtenVersions.entries()) {
        const changelogPath = join(resolvedOutputPath, RelativeFilePath.of(`${format(releaseDate, "yyyy-MM-dd")}.mdx`));

        let changelogContent = "";
        for (const [_, changelog] of versions.entries()) {
            changelogContent += changelog;
            changelogContent += "\n\n";
        }

        await writeFile(changelogPath, changelogContent);
    }
}
