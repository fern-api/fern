import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { GeneratorReleaseRequest } from "@fern-fern/generators-sdk/api/resources/generators";
import SentryCli from "@sentry/cli";
import { existsSync } from "fs";
import path from "path";
import semver from "semver";

import {
    PublishDocker,
    PublishDockerConfiguration,
    PublishSentryConfiguration,
    SentrySourceMapArtifact
} from "../../config/api/index.js";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces.js";
import { parseGeneratorReleasesFile } from "../../utils/convertVersionsFileToReleases.js";
import { runCommands, subVersion } from "../../utils/publishUtilities.js";

const SENTRY_ORG = "buildwithfern";
const DEFAULT_SOURCE_MAP_URL_PREFIX = "app:///";

interface VersionFilePair {
    latestChangelogPath: string;
    previousChangelogPath: string;
}

interface SentryEnvVariables {
    dsn: string;
    environment: string;
    release: string;
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
    context.logger.info(`Publishing generator ${generatorId}@${typeof version === "string" ? version : "latest"}...`);

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
    // Instance of PublishDocker configuration, leverage container CLI here
    if ("docker" in publishConfig) {
        const unparsedCommands = publishConfig.preBuildCommands;
        const preBuildCommands = Array.isArray(unparsedCommands)
            ? unparsedCommands
            : unparsedCommands
              ? [unparsedCommands]
              : [];

        const sentryEnvVariables = getSentryEnvVariables(publishConfig.sentry, publishVersion, context);

        await runCommands(preBuildCommands, context, workingDirectory);
        await buildAndPushContainerImage(publishConfig.docker, publishVersion, sentryEnvVariables, context);
        if (sentryEnvVariables != null) {
            await uploadToSentry(publishConfig.sentry!, sentryEnvVariables, context);
        }
    } else {
        // Instance of PublishCommand configuration, leverage these commands outright
        const unparsedCommands = publishConfig.command;
        const commands = Array.isArray(unparsedCommands) ? unparsedCommands : [unparsedCommands];
        const versionSubstitution = publishConfig.versionSubstitution;
        const subbedCommands = commands.map((command) => subVersion(command, publishVersion, versionSubstitution));
        await runCommands(subbedCommands, context, workingDirectory);
    }
}

function getSentryEnvVariables(
    sentryConfig: PublishSentryConfiguration | undefined,
    publishVersion: string,
    context: TaskContext
): SentryEnvVariables | null {
    if (sentryConfig == null) return null;

    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn == null || sentryDsn.length == 0) {
        context.logger.warn("SENTRY_DSN not set; skipping Sentry uploads.");
        return null;
    }

    const sentryRelease = `${sentryConfig.name}@${publishVersion}`;
    const sentryEnvironment = process.env.SENTRY_ENVIRONMENT ?? "production";
    return { dsn: sentryDsn, release: sentryRelease, environment: sentryEnvironment };
}

async function buildAndPushContainerImage(
    containerConfig: PublishDockerConfiguration,
    version: string,
    sentryEnvVariables: SentryEnvVariables | null,
    context: TaskContext
) {
    const dockerHubUsername = process?.env?.DOCKER_USERNAME;
    const dockerHubPassword = process?.env?.DOCKER_PASSWORD;
    if (!dockerHubUsername || !dockerHubPassword) {
        context.failAndThrow("Docker Hub credentials not found within your environment variables.");
    }

    context.logger.debug(`Logging into container registry...`);
    await loggingExeca(context.logger, "docker", ["login", "-u", dockerHubUsername, "--password-stdin"], {
        doNotPipeOutput: true,
        input: dockerHubPassword
    });

    const images = [containerConfig.image, ...(containerConfig.aliases ?? [])];
    const versionTags = images.map((image) => `${image}:${version}`);
    const latestTags = images.map((image) => `${image}:latest`);
    const allTags = [...versionTags, ...latestTags];
    const tagArgs = allTags.map((imageTag) => ["-t", imageTag]).flat();
    context.logger.debug(`Pushing container images ${allTags[0]} using docker...`);
    if (images.length > 1) {
        context.logger.debug(`Also tagging with aliases: ${images.slice(1).join(", ")}`);
    }
    context.logger.debug(`Also tagging as latest: ${latestTags.join(", ")}`);
    const standardBuildOptions = [
        "build",
        ...(sentryEnvVariables != null
            ? [
                  "--build-arg",
                  `SENTRY_DSN=${sentryEnvVariables.dsn}`,
                  "--build-arg",
                  `SENTRY_ENVIRONMENT=${sentryEnvVariables.environment}`,
                  "--build-arg",
                  `SENTRY_RELEASE=${sentryEnvVariables.release}`
              ]
            : []),
        "--push",
        "--platform",
        "linux/amd64,linux/arm64",
        "--cache-from",
        "type=gha",
        "--cache-to",
        "type=gha,mode=max",
        "-f",
        containerConfig.file,
        ...tagArgs,
        containerConfig.context
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

async function uploadToSentry(
    sentryConfig: PublishSentryConfiguration,
    sentryEnvVariables: SentryEnvVariables,
    context: TaskContext
): Promise<void> {
    const sourceMaps = sentryConfig.sourceMaps ?? [];
    if (sourceMaps.length === 0) {
        return;
    }

    const authToken = process.env.SENTRY_AUTH_TOKEN;
    if (authToken == null || authToken.length === 0) {
        context.logger.debug("SENTRY_AUTH_TOKEN not set; skipping Sentry uploads.");
        return;
    }

    const cli = new SentryCli(null, {
        authToken,
        org: SENTRY_ORG,
        project: sentryConfig.project
    });

    for (const artifact of sourceMaps) {
        await uploadSourceMapArtifact({ cli, release: sentryEnvVariables.release, artifact, context });
    }
}

async function uploadSourceMapArtifact({
    cli,
    release,
    artifact,
    context
}: {
    cli: SentryCli;
    release: string;
    artifact: SentrySourceMapArtifact;
    context: TaskContext;
}): Promise<void> {
    if (!existsSync(artifact.dir)) {
        context.logger.warn(`Source map directory ${artifact.dir} does not exist; skipping.`);
        return;
    }

    const urlPrefix = artifact.urlPrefix ?? DEFAULT_SOURCE_MAP_URL_PREFIX;
    context.logger.info(`Uploading source maps from ${artifact.dir} for Sentry release ${release}...`);

    try {
        await cli.execute(
            ["sourcemaps", "upload", "--release", release, "--url-prefix", urlPrefix, artifact.dir],
            /* live */ true
        );
    } catch (e) {
        // Don't fail the publish because Sentry is down or mis-configured.
        context.logger.warn(`Failed to upload source maps to Sentry: ${e instanceof Error ? e.message : String(e)}`);
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
