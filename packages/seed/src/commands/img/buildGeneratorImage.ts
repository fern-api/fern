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

    if (preBuild.length > 0) {
        context.logger.info("Running pre-build commands...");
        // Use workingDirectory if specified, otherwise use repoRoot
        const workingDir = publishConfig.workingDirectory
            ? path.join(repoRoot, publishConfig.workingDirectory)
            : repoRoot;
        await runCommands(preBuild, context, workingDir, shouldPipeOutput(logLevel));
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
            doNotPipeOutput: !shouldPipeOutput(logLevel),
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
    const baseImageNoTag = testDocker.image.replace(/:latest$/, "").replace(/:.*$/, "");
    const topLevelAliases = generator.workspaceConfig.imageAliases ?? [];
    const destTags = [`${baseImageNoTag}:${version}`, ...topLevelAliases.map((a) => `${a}:${version}`)];

    context.logger.info(`Building docker image(s): ${destTags.join(", ")}`);

    for (const cmd of commands) {
        if (!cmd) {
            continue;
        }

        // Modify docker build commands to use versioned tags instead of :latest
        const modifiedCmd = modifyDockerBuildCommand(cmd, baseImageNoTag, topLevelAliases, version, context);

        const parts = modifiedCmd.split(" ").filter(Boolean);
        const bin = parts[0];
        const args = parts.slice(1);
        if (!bin) {
            throw new Error(`Invalid command: ${cmd}`);
        }
        const { exitCode } = await loggingExeca(context.logger, bin, args, {
            doNotPipeOutput: !shouldPipeOutput(logLevel),
            cwd: repoRoot
        });
        if (exitCode !== 0) {
            throw new Error(`Failed to run ${modifiedCmd}`);
        }
    }

    context.logger.info(`Successfully built and tagged docker image(s): ${destTags.join(", ")}`);
}

function modifyDockerBuildCommand(
    command: string,
    baseImage: string,
    aliases: string[],
    version: string,
    context: TaskContext
): string {
    // Check if this is a docker build command
    if (!command.includes("docker build")) {
        context.logger.debug(`Command doesn't contain 'docker build', running as-is: ${command}`);
        return command;
    }

    // Replace any :latest tags with the specified version
    let modified = command.replace(new RegExp(`${baseImage}:latest`, "g"), `${baseImage}:${version}`);

    // Also replace any alias :latest tags
    for (const alias of aliases) {
        modified = modified.replace(new RegExp(`${alias}:latest`, "g"), `${alias}:${version}`);
    }

    // If the command had -t <image>:latest, also add tags for all aliases
    if (modified !== command && aliases.length > 0) {
        // Find where to insert additional -t flags (right before the context path at the end)
        const parts = modified.split(" ");
        const contextIndex = parts.findIndex(
            (p, i) => i > 0 && !p.startsWith("-") && parts[i - 1] !== "-t" && parts[i - 1] !== "-f"
        );

        if (contextIndex > 0) {
            const additionalTags = aliases.map((a) => `-t ${a}:${version}`).join(" ");
            parts.splice(contextIndex, 0, ...additionalTags.split(" "));
            modified = parts.join(" ");
        }
    }

    if (modified !== command) {
        context.logger.debug(`Modified command: ${command} → ${modified}`);
    }

    return modified;
}

export function shouldPipeOutput(logLevel: LogLevel): boolean {
    return logLevel === LogLevel.Debug || logLevel === LogLevel.Trace;
}
