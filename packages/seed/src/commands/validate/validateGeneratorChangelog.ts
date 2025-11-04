import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { validateVersionsYml } from "./validateVersionsYml";

const parseReleaseOrThrow = serializers.generators.GeneratorReleaseRequest.parseOrThrow;

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

    if (generatorConfig.changelogLocation == null) {
        context.logger.warn("No changelog location specified");
        return;
    }

    const absolutePathToChangelog = join(
        generator.absolutePathToWorkspace,
        RelativeFilePath.of(generatorConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.logger.error(`Changelog does not exist at path ${absolutePathToChangelog}`);
        return;
    }

    // Use validateVersionsYml with generator-specific schema parser
    await validateVersionsYml({
        absolutePathToChangelog,
        context,
        schemaParser: (entry) => {
            // Validate against GeneratorReleaseRequest schema
            parseReleaseOrThrow({ generatorId, ...entry });
        }
    });
}
