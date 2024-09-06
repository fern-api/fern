import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";

// TODO: we should share the language and generator type with the FDR definition
export async function validateGenerator({
    generator,
    context
}: {
    generator: GeneratorWorkspace;
    context: TaskContext;
}): Promise<void> {
    const generatorId = generator.workspaceName;
    const generatorConfig = generator.workspaceConfig;

    // Register generator versions
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

        // We've found a versions file, let's read it and register all the versions
        context.logger.info(`Validating generator ${generatorId} releases from ${absolutePathToChangelogLocation}...`);
        await parseGeneratorReleasesFile({
            generatorId,
            changelogPath: absolutePathToChangelogLocation,
            context,
            // NOOP
            action: async (_) => {}
        });
        context.logger.info("Validation complete.");
    } else {
        context.logger.error(
            `No changelog location specified for generator ${generatorId}, continuing without any validation versions. To record generator versions, specify a changelog location at: \`changelogLocation\`, within your seed.yml.`
        );
    }
}
