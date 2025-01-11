import path from "path";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { PublishCommand } from "../../config/api";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces";
import { runCommands, subVersion } from "../../utils/publishUtilities";
import { VersionFilePair, getNewCliVersion } from "../../utils/versionUtilities";

export async function publishCli({
    version,
    context,
    isDevRelease
}: {
    version: string | VersionFilePair;
    context: TaskContext;
    isDevRelease: boolean | undefined;
}): Promise<void> {
    const cliWorkspace = await loadCliWorkspace();
    context.logger.info(`Publishing CLI@${version}...`);

    let publishVersion: string;
    if (typeof version !== "string") {
        // We were given two version files, so we need to compare them to find if any new
        // versions have been added since the last publish.
        context.logger.info(
            `Checking for new version between ${version.previousChangelogPath} (previous) and ${version.latestChangelogPath} (latest)`
        );
        const maybeNewVersion = await getNewCliVersion({
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
    if (isDevRelease) {
        context.logger.info(`Publishing CLI@${publishVersion} as a dev release...`);
        publishConfig = cliWorkspace.workspaceConfig.publishDev;
    } else if (publishVersion.includes("rc")) {
        context.logger.info(`Publishing CLI@${publishVersion} as a pre-release...`);
        publishConfig = cliWorkspace.workspaceConfig.publishRc;
    } else {
        context.logger.info(`Publishing CLI@${publishVersion} as a production release...`);
        publishConfig = cliWorkspace.workspaceConfig.publishGa;
    }

    // Instance of PublishCommand configuration, leverage these commands outright
    const unparsedCommands = publishConfig.command;
    const commands = Array.isArray(unparsedCommands) ? unparsedCommands : [unparsedCommands];
    const versionSubsitution = publishConfig.versionSubstitution;
    const subbedCommands = commands.map((command) => subVersion(command, publishVersion, versionSubsitution));

    let workingDirectory = cliWorkspace.absolutePathToWorkspace;
    if (publishConfig.workingDirectory) {
        workingDirectory = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(publishConfig.workingDirectory))
        );
    }
    await runCommands(subbedCommands, context, workingDirectory);
}
