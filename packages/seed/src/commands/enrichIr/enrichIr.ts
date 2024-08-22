import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { getIrVersionForGeneratorVersion } from "../../../../cli/generation/local-generation/local-workspace-runner/node_modules/@fern-api/ir-migrations/src";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";
import yaml from "js-yaml";
import { writeFile } from "fs/promises";

export async function enrichChangelogWithIr({
    generator,
    context
}: {
    generator: GeneratorWorkspace;
    context: TaskContext;
}): Promise<void> {
    const generatorConfig = generator.workspaceConfig;
    context.logger.info(`Enriching changelog with IR data for generator ${generator.workspaceName}`);
    if (generatorConfig.changelogLocation) {
        const absolutePathToChangelogLocation = join(
            generator.absolutePathToWorkspace,
            RelativeFilePath.of(generatorConfig.changelogLocation)
        );
        if (!(await doesPathExist(absolutePathToChangelogLocation))) {
            context.logger.error(
                `Specified changelog location (${absolutePathToChangelogLocation}) not found, continuing without registering versions for generator ${generator.workspaceName}.`
            );
            return undefined;
        }
        const enrichedReleases = await parseGeneratorReleasesFile({
            generatorId: generator.workspaceName,
            changelogPath: absolutePathToChangelogLocation,
            context,
            action: async (release) => {
                const ver = await getIrVersionForGeneratorVersion({
                    targetGenerator: {
                        name: "fernapi/fern-python-sdk",
                        version: release.version
                    },
                    context
                });
                if (!ver) {
                    context.logger.warn(
                        `Failed to get IR version for generator version ${release.version}, continuing without enriching release.`
                    );
                    return;
                }

                release.irVersion = Number.parseInt(ver.replace("v", ""));
            }
        });

        const enrichedChangelog = yaml.dump(enrichedReleases);
        await writeFile(absolutePathToChangelogLocation + ".new", enrichedChangelog);
    }
}
