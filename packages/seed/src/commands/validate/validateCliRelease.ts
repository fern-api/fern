import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";

export async function validateCliRelease({ context }: { context: TaskContext }): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();
    if (cliWorkspace == null) {
        context.logger.error("Failed to find CLI workspace, continuing without registering CLI releases.");
        return;
    }
    if (cliWorkspace.workspaceConfig.changelogLocation == null) {
        context.logger.error(
            "No changelog location specified, continuing without validating CLI releases. To record CLI releases, specify a changelog location at: `changelogLocation`."
        );
        return;
    }
    const absolutePathToChangelogLocation = join(
        cliWorkspace.absolutePathToWorkspace,
        RelativeFilePath.of(cliWorkspace.workspaceConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelogLocation))) {
        context.logger.error(
            `Specified changelog location (${absolutePathToChangelogLocation}) not found, continuing without validating versions for CLI.`
        );
        return undefined;
    }

    // We've found a versions file, let's read it and validate all the versions
    const changelogs = yaml.load((await readFile(absolutePathToChangelogLocation)).toString());
    context.logger.info("Validating CLI releases...");
    if (Array.isArray(changelogs)) {
        for (const entry of changelogs) {
            try {
                const release = serializers.generators.CliReleaseRequest.parseOrThrow(entry);
            } catch (e) {
                context.logger.error(`Error parsing release ${JSON.stringify(entry)}: ${(e as Error)?.message}`);
            }
        }
    }
}
