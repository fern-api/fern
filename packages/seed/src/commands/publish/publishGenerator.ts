import path from "path";
import semver from "semver";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

import { GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";

import { PublishDockerConfiguration } from "../../config/api";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases";
import { runCommands, subVersion } from "../../utils/publishUtilities";

interface VersionFilePair {
    latestChangelogPath: string;
    previousChangelogPath: string;
}

export async function publishGenerator({
    generator,
    version,
    context
}: {
    generator: GeneratorWorkspace;
    version: string | VersionFilePair;
    context: TaskContext;
}): Promise<void> {
    const generatorId = generator.workspaceName;
    context.logger.info(`Publishing generator ${generatorId}@${version}...`);

    let publishVersion: string;
    if (typeof version !== "string") {
        // We were given two version files, so we need to compare them to find if any new
        // versions have been added since the last publish.
        const maybeNewVersion = await getNewVersion({
            generatorId,
            versionFilePair: version,
            context
        });

        if (maybeNewVersion == null) {
            context.logger.error(
                "No version to publish! There must not have been a new version since the last publish. Failing quietly"
            );
            return;
        }
        publishVersion = maybeNewVersion;
    } else {
        publishVersion = version;
    }

    const publishConfig = generator.workspaceConfig.publish;
    let workingDirectory = generator.absolutePathToWorkspace;
    if (publishConfig.workingDirectory) {
        workingDirectory = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(publishConfig.workingDirectory))
        );
    }
    // Instance of PublishDocker configuration, leverage docker CLI here
    if ("docker" in publishConfig) {
        const unparsedCommands = publishConfig.preBuildCommands;
        const preBuildCommands = Array.isArray(unparsedCommands)
            ? unparsedCommands
            : unparsedCommands
              ? [unparsedCommands]
              : [];

        await runCommands(preBuildCommands, context, workingDirectory);
        await buildAndPushDockerImage(publishConfig.docker, publishVersion, context);
    } else {
        // Instance of PublishCommand configuration, leverage these commands outright
        const unparsedCommands = publishConfig.command;
        const commands = Array.isArray(unparsedCommands) ? unparsedCommands : [unparsedCommands];
        const versionSubsitution = publishConfig.versionSubstitution;
        const subbedCommands = commands.map((command) => subVersion(command, publishVersion, versionSubsitution));
        await runCommands(subbedCommands, context, workingDirectory);
    }
}

async function buildAndPushDockerImage(
    dockerConfig: PublishDockerConfiguration,
    version: string,
    context: TaskContext
) {
    // Push the Docker image to the registry
    const dockerHubUsername = process?.env?.DOCKER_USERNAME;
    const dockerHubPassword = process?.env?.DOCKER_PASSWORD;
    if (!dockerHubUsername || !dockerHubPassword) {
        context.failAndThrow("Docker Hub credentials not found within your environment variables.");
    }

    context.logger.debug("Logging into Docker Hub...");
    await loggingExeca(context.logger, "docker", ["login", "-u", dockerHubUsername, "--password-stdin"], {
        doNotPipeOutput: true,
        input: dockerHubPassword
    });

    // Build and push the Docker image, now that you've run the pre-build commands
    const imageTag = `${dockerConfig.image}:${version}`;
    context.logger.debug(`Pushing Docker image ${imageTag} to Docker Hub...`);
    const standardBuildOptions = [
        "build",
        "--push",
        "--platform",
        "linux/amd64,linux/arm64",
        "-f",
        dockerConfig.file,
        "-t",
        imageTag,
        dockerConfig.context
    ];
    try {
        await loggingExeca(context.logger, "docker", standardBuildOptions, { doNotPipeOutput: true });
    } catch (e) {
        if (e instanceof Error && e.message.includes("Multi-platform build is not supported for the docker driver")) {
            context.logger.error(
                "Docker cannot build multi-platform images with the current driver, trying `docker buildx`."
            );
            await loggingExeca(context.logger, "docker", ["buildx", ...standardBuildOptions], {
                doNotPipeOutput: false
            });
            return;
        }
        throw e;
    }
}

// Take two files, traditionally the latest version file (e.g. the file on the branch merging to main),
// and the previous version file (e.g. the file on the main branch), and compare them to find the most recent version
//
// The most recent version is defined here as the most recent version in the latest version file that is not in the previous version file
export async function getNewVersion({
    generatorId,
    versionFilePair,
    context
}: {
    generatorId: string;
    versionFilePair: VersionFilePair;
    context: TaskContext;
}): Promise<string | undefined> {
    // Our action performed on each generator release in the file is to
    // simply collect the version ID within a set for comparison later
    const collectVersions = (versionsSet: Set<string>) => {
        return async (release: GeneratorReleaseRequest) => {
            versionsSet.add(release.version);
        };
    };

    const latestVersionGeneratorReleasesVersions = new Set<string>();
    await parseGeneratorReleasesFile({
        generatorId,
        changelogPath: versionFilePair.latestChangelogPath,
        context,
        action: collectVersions(latestVersionGeneratorReleasesVersions)
    });
    const previousVersionGeneratorReleaseVersions = new Set<string>();
    await parseGeneratorReleasesFile({
        generatorId,
        changelogPath: versionFilePair.previousChangelogPath,
        context,
        action: collectVersions(previousVersionGeneratorReleaseVersions)
    });

    // Get generator versions not in the previous version file
    //
    // Sadly TS does not have a set difference function, so we manually filter the "latest"
    // array for versions explicitly not in the previous versions set
    const newVersions = Array.from(latestVersionGeneratorReleasesVersions).filter(
        (item) => !previousVersionGeneratorReleaseVersions.has(item)
    );

    // Sort the resultant array of new versions by semantic version and return the largest / "most recent"
    return (
        newVersions
            .map((ver) => semver.parse(ver))
            .filter((ver): ver is semver.SemVer => ver != null)
            // Here we compare semantic versions to try to get the largest version that's new
            // We negate the number to get the largest version first
            .sort((a, b) => -a.compare(b))[0]
            ?.toString()
    );
}
