import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";
import { validateVersionsYml } from "./validateVersionsYml";

export async function validateCliRelease({ context }: { context: TaskContext }): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();

    if (cliWorkspace == null) {
        context.logger.error("Failed to load CLI workspace");
        return;
    }

    if (cliWorkspace.workspaceConfig.changelogLocation == null) {
        context.logger.warn("No changelog location specified");
        return;
    }

    const absolutePathToChangelog = join(
        cliWorkspace.absolutePathToWorkspace,
        RelativeFilePath.of(cliWorkspace.workspaceConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelog))) {
        context.logger.error(`Changelog does not exist at path ${cliWorkspace.workspaceConfig.changelogLocation}`);
        return;
    }

    // Use validateVersionsYml with CLI-specific schema parser
    await validateVersionsYml({
        absolutePathToChangelog,
        context,
        schemaParser: (entry) => {
            // Validate against CliReleaseRequest schema
            serializers.generators.CliReleaseRequest.parseOrThrow(entry);
        }
    });
}
