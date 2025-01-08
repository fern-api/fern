import { mkdir, readdir, rm } from "fs/promises";

import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistryClient } from "@fern-fern/generators-sdk";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";
import { writeChangelogEntries, writeChangelogsToFile } from "./writeChangelogEntries";

export async function generateGeneratorChangelog({
    context,
    generator,
    outputPath,
    fdrClient,
    cleanOutputDirectory
}: {
    context: TaskContext;
    generator: GeneratorWorkspace;
    outputPath: string | undefined;
    fdrClient: FernRegistryClient;
    cleanOutputDirectory: boolean;
}): Promise<void> {
    const resolvedOutputPath =
        outputPath == null
            ? AbsoluteFilePath.of(process.cwd())
            : outputPath.startsWith("/")
              ? AbsoluteFilePath.of(outputPath)
              : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(outputPath));

    await mkdir(resolvedOutputPath, { recursive: true });

    if (cleanOutputDirectory) {
        const files = await readdir(resolvedOutputPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = join(resolvedOutputPath, RelativeFilePath.of(file.name));
            if (file.isDirectory()) {
                // This shouldn't happen, but let's skip if it does to be safe
                continue;
            } else {
                await rm(filePath);
            }
        }
    }

    const generatorConfig = generator.workspaceConfig;
    if (generatorConfig.changelogLocation == null) {
        context.logger.error(
            `No changelog location specified, unable to generate changelog. To register releases for generator ${generator.workspaceName}, specify a changelog location at: \`changelogLocation\`.`
        );
        return;
    }

    const absolutePathToChangelogLocation = join(
        generator.absolutePathToWorkspace,
        RelativeFilePath.of(generatorConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelogLocation))) {
        context.logger.error(
            `Specified changelog location (${absolutePathToChangelogLocation}) not found, stopping changelog generation.`
        );
        return;
    }

    // Here we'll collect the changelogs so they're keyed by date, the map is essentially Release Date -> Version -> Changelog string
    const writtenVersions = new Map<Date, Map<string, string>>();
    const generatorId = generator.workspaceName;
    await parseGeneratorReleasesFile({
        generatorId,
        changelogPath: absolutePathToChangelogLocation,
        context,
        action: async (release) => {
            let createdAt = release.createdAt;
            if (release.isYanked != null) {
                context.logger.error(
                    `Release ${release.version} for generator ${generatorId} has been yanked, skipping this release.`
                );
                return;
            }

            if (createdAt == null) {
                const releaseRequest = await fdrClient.generators.versions.getGeneratorRelease(
                    generatorId,
                    release.version
                );
                if (!releaseRequest.ok || releaseRequest.body.createdAt == null) {
                    context.logger.error(
                        `Release ${release.version} for generator ${generatorId} does not have a createdAt value, and could not retrieve one from FDR, defaulting to today...`
                    );
                    // This will typically happen if you've added a new release to the versions file and haven't yet registered it with FDR yet
                    createdAt = new Date().toISOString();
                } else {
                    createdAt = releaseRequest.body.createdAt;
                }
            }

            const releaseDate = new Date(createdAt);
            if (!writtenVersions.has(releaseDate)) {
                writtenVersions.set(releaseDate, new Map());
            }

            writtenVersions
                .get(releaseDate)!
                .set(release.version, writeChangelogEntries(release.version, release.changelogEntry));
        }
    });

    await writeChangelogsToFile(resolvedOutputPath, writtenVersions);
}
