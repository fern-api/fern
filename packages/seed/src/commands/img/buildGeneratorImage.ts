import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import path from "path";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { runCommands } from "../../utils/publishUtilities";

export async function buildGeneratorImage({
    generator,
    version,
    context,
    logLevel
}: {
    generator: GeneratorWorkspace;
    version: string;
    context: TaskContext;
    logLevel: LogLevel;
}): Promise<void> {
    try {
        const repoRoot = path.dirname(path.dirname(generator.absolutePathToWorkspace));
        const publishConfig = generator.workspaceConfig.publish;
        const dockerConfig = publishConfig && "docker" in publishConfig ? publishConfig.docker : undefined;

        if (dockerConfig) {
            await buildFromPublishConfig(generator, dockerConfig, publishConfig, version, repoRoot, context, logLevel);
        } else {
            await buildFromTestConfigFallback(generator, version, repoRoot, context, logLevel);
        }

        context.logger.info("Image(s) available in your local docker daemon.");
    } catch (error) {
        context.logger.error(
            `Encountered error while building docker image. ${
                error instanceof Error ? (error.stack ?? error.message) : error
            }`
        );
        throw error;
    }
}

async function buildFromPublishConfig(
    generator: GeneratorWorkspace,
    dockerConfig: { file: string; image: string; context?: string; aliases?: string[] },
    publishConfig: { preBuildCommands?: string | string[]; workingDirectory?: string },
    version: string,
    repoRoot: string,
    context: TaskContext,
    logLevel: LogLevel
): Promise<void> {
    const preBuild = Array.isArray(publishConfig.preBuildCommands)
        ? publishConfig.preBuildCommands
        : publishConfig.preBuildCommands
          ? [publishConfig.preBuildCommands]
          : [];

    // Determine if we should pipe output based on log level
    const shouldPipeOutput = logLevel === LogLevel.Debug || logLevel === LogLevel.Trace;

    if (preBuild.length > 0) {
        context.logger.info("Running pre-build commands...");
        // Use workingDirectory if specified, otherwise use repoRoot
        const workingDir = publishConfig.workingDirectory
            ? path.join(repoRoot, publishConfig.workingDirectory)
            : repoRoot;
        await runCommands(preBuild, context, workingDir, shouldPipeOutput);
    }

    const publishAliases = dockerConfig.aliases ?? [];
    const topLevelAliases = generator.workspaceConfig.imageAliases ?? [];
    const aliases = publishAliases.length > 0 ? publishAliases : topLevelAliases;

    const images = [dockerConfig.image, ...aliases].map((name) => `${name}:${version}`);
    const tagArgs = images.map((i) => ["-t", i]).flat();

    context.logger.info(`Building Docker image(s): ${images.join(", ")}`);

    await loggingExeca(
        context.logger,
        "docker",
        ["build", "-f", dockerConfig.file, ...tagArgs, dockerConfig.context ?? "."],
        {
            doNotPipeOutput: !shouldPipeOutput,
            cwd: repoRoot
        }
    );

    context.logger.info(`Successfully built and tagged docker image(s): ${images.join(", ")}`);
}

async function buildFromTestConfigFallback(
    generator: GeneratorWorkspace,
    version: string,
    repoRoot: string,
    context: TaskContext,
    logLevel: LogLevel
): Promise<void> {
    const testDocker = generator.workspaceConfig.test?.docker;
    if (!testDocker) {
        throw new Error(`No publish.docker or test.docker config found for ${generator.workspaceName}`);
    }

    context.logger.info("No publish.docker config found. Using test.docker fallback...");

    const commands = Array.isArray(testDocker.command) ? testDocker.command : [testDocker.command];
    const shouldPipeOutput = logLevel === LogLevel.Debug || logLevel === LogLevel.Trace;

    context.logger.info(`Building docker image for ${generator.workspaceName}...`);
    for (const cmd of commands) {
        if (!cmd) {
            continue;
        }
        const parts = cmd.split(" ").filter(Boolean);
        const bin = parts[0];
        const args = parts.slice(1);
        if (!bin) {
            throw new Error(`Invalid command: ${cmd}`);
        }
        const { exitCode } = await loggingExeca(context.logger, bin, args, {
            doNotPipeOutput: !shouldPipeOutput,
            cwd: repoRoot
        });
        if (exitCode !== 0) {
            throw new Error(`Failed to run ${cmd}`);
        }
    }

    const baseImageNoTag = testDocker.image.replace(/:latest$/, "").replace(/:.*$/, "");
    const topLevelAliases = generator.workspaceConfig.imageAliases ?? [];
    const latestTags = [`${baseImageNoTag}:latest`, ...topLevelAliases.map((a) => `${a}:latest`)];

    context.logger.debug("Removing :latest tags...");
    for (const latestTag of latestTags) {
        try {
            await loggingExeca(context.logger, "docker", ["rmi", latestTag], { doNotPipeOutput: true });
        } catch {}
    }

    const destTags = [`${baseImageNoTag}:${version}`, ...topLevelAliases.map((a) => `${a}:${version}`)];
    context.logger.info(`Tagging image with version ${version}...`);
    for (const dest of destTags) {
        await loggingExeca(context.logger, "docker", ["tag", `${baseImageNoTag}:latest`, dest], {
            doNotPipeOutput: true
        });
    }

    context.logger.info(`Successfully built and tagged docker image(s): ${destTags.join(", ")}`);
}
