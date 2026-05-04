import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import path from "path";

import { PublishCommand } from "../../config/api/index.js";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces.js";
import { getPublishType } from "../../utils/publishRouting.js";
import { runCommands, subVersion } from "../../utils/publishUtilities.js";
import { getNewCliVersion, VersionFilePair } from "../../utils/versionUtilities.js";

export interface PublishCliResult {
    published: boolean;
    version?: string;
}

export async function publishCli({
    version,
    context,
    isDevRelease
}: {
    version: string | VersionFilePair;
    context: TaskContext;
    isDevRelease: boolean | undefined;
}): Promise<PublishCliResult> {
    const cliWorkspace = await loadCliWorkspace();

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
            context.logger.info("No new version to publish. Skipping.");
            return { published: false };
        }
        publishVersion = maybeNewVersion;
    } else {
        publishVersion = version;
    }

    context.logger.info(`Publishing CLI@${publishVersion}...`);

    const publishType = getPublishType({ version: publishVersion, isDevRelease });

    let publishConfig: PublishCommand;
    switch (publishType) {
        case "dev":
            context.logger.info(`Publishing CLI@${publishVersion} as a dev release...`);
            publishConfig = cliWorkspace.workspaceConfig.publishDev;
            break;
        case "prerelease":
            context.logger.info(`Publishing CLI@${publishVersion} as a pre-release...`);
            // publishRc is named for historical reasons; it handles all prerelease identifiers.
            publishConfig = cliWorkspace.workspaceConfig.publishRc;
            break;
        case "ga":
            context.logger.info(`Publishing CLI@${publishVersion} as a production release...`);
            publishConfig = cliWorkspace.workspaceConfig.publishGa;
            break;
        default:
            assertNever(publishType);
    }

    // Instance of PublishCommand configuration, leverage these commands outright
    const unparsedCommands = publishConfig.command;
    const commands = Array.isArray(unparsedCommands) ? unparsedCommands : [unparsedCommands];
    const versionSubstitution = publishConfig.versionSubstitution;
    const subbedCommands = commands.map((command) => subVersion(command, publishVersion, versionSubstitution));

    let workingDirectory = cliWorkspace.absolutePathToWorkspace;
    if (publishConfig.workingDirectory) {
        workingDirectory = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(publishConfig.workingDirectory))
        );
    }
    await runCommands(subbedCommands, context, workingDirectory);
    return { published: true, version: publishVersion };
}
