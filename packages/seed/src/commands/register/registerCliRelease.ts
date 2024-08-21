import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";
import * as serializers from "@fern-fern/generators-sdk/serialization";
import { readFile } from "fs/promises";
import YAML from "yaml";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";

export async function registerCliRelease({
    fdrClient,
    context
}: {
    fdrClient: FdrClient;
    context: TaskContext;
}): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();
    if (cliWorkspace == null) {
        context.logger.error("Failed to find CLI workspace, continuing without registering CLI releases.");
        return;
    }
    if (cliWorkspace.workspaceConfig.changelogLocation == null) {
        context.logger.error(
            "No changelog location specified, continuing without registering CLI releases. To register CLI releases, specify a changelog location at: `changelogLocation`."
        );
        return;
    }
    const absolutePathToChangelogLocation = join(
        cliWorkspace.absolutePathToWorkspace,
        RelativeFilePath.of(cliWorkspace.workspaceConfig.changelogLocation)
    );
    if (!(await doesPathExist(absolutePathToChangelogLocation))) {
        context.logger.error(
            `Specified changelog location (${absolutePathToChangelogLocation}) not found, continuing without registering versions for CLI.`
        );
        return undefined;
    }

    // We've found a versions file, let's read it and register all the versions
    const changelogs = YAML.parseDocument((await readFile(absolutePathToChangelogLocation)).toString());
    context.logger.info("Registering CLI releases...");
    if (YAML.isSeq(changelogs)) {
        for (const entry of changelogs.items) {
            if (!YAML.isMap(entry)) {
                continue;
            }
            try {
                const release = serializers.generators.CliReleaseRequest.parseOrThrow(entry);
                context.logger.debug(`Registering CLI release: ${release.version}`);
                fdrClient.generators.cli.upsertCliRelease(release);
            } catch (e) {
                context.logger.error(`Error parsing release: ${e}`);
            }
        }
    }
}
