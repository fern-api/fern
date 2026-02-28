import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";

import { PublishCommand } from "../../config/api/index.js";
import { loadCliWorkspace } from "../../loadGeneratorWorkspaces.js";
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
    const versionSubstitution = publishConfig.versionSubstitution;
    const subbedCommands = commands.map((command) => subVersion(command, publishVersion, versionSubstitution));

    let workingDirectory = cliWorkspace.absolutePathToWorkspace;
    if (publishConfig.workingDirectory) {
        workingDirectory = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(publishConfig.workingDirectory))
        );
    }

    const isGaRelease = !isDevRelease && !publishVersion.includes("rc");
    if (isGaRelease && subbedCommands.length > 1) {
        // For GA releases, run build commands first, then determine the correct publish tag
        const buildCommands = subbedCommands.slice(0, -1);
        const publishCommand = subbedCommands[subbedCommands.length - 1]!;

        await runCommands(buildCommands, context, workingDirectory);

        // Read the package name and version from package.json
        const distPackageJsonPath = path.join(workingDirectory, "dist", "prod", "package.json");
        const distPackageJson = JSON.parse(readFileSync(distPackageJsonPath, "utf-8"));
        const packageName = distPackageJson.name;

        // Fetch the current latest version from npm, defaulting to "0.0.0" if unpublished
        let currentLatest = "0.0.0";
        try {
            const result = execSync(`npm view ${packageName} dist-tags.latest`, { encoding: "utf-8" }).trim();
            if (result) {
                currentLatest = result;
            }
        } catch {
            context.logger.info(`Could not fetch latest version for ${packageName}, defaulting to 0.0.0`);
        }

        // Compare using semver: check if the version being published is older than current latest
        let isOlderThanLatest = false;
        try {
            const semverResult = execSync(`npx -y semver ${publishVersion} -r "<${currentLatest}"`, {
                encoding: "utf-8"
            }).trim();
            isOlderThanLatest = semverResult.length > 0;
        } catch {
            // Exit code 1 means the version does not satisfy the range (i.e. it is not older)
            isOlderThanLatest = false;
        }

        let finalPublishCommand = publishCommand;
        if (isOlderThanLatest) {
            context.logger.info(
                `Version ${publishVersion} is older than current latest (${currentLatest}), publishing with --tag backport`
            );
            finalPublishCommand = publishCommand.replace("--tag latest", "--tag backport");
        } else {
            context.logger.info(
                `Version ${publishVersion} is >= current latest (${currentLatest}), publishing as latest`
            );
        }

        await runCommands([finalPublishCommand], context, workingDirectory);
    } else {
        await runCommands(subbedCommands, context, workingDirectory);
    }

    return { published: true, version: publishVersion };
}
