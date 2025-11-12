import { TaskContext } from "@fern-api/task-context";
import path from "path";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { runScript } from "../../runScript";

export async function buildGeneratorImage({
    generator,
    version,
    context
}: {
    generator: GeneratorWorkspace;
    version: string;
    context: TaskContext;
}): Promise<void> {
    try {
        const dockerCommands = getDockerBuildCommands(generator);

        context.logger.info(`Building docker image for ${generator.workspaceName}...`);

        await buildWithSeedCommands(dockerCommands, generator, context);

        const destTags = computeDestTags(generator, version);

        context.logger.info(`Tagging image with version ${version}...`);
        if (destTags.length > 1) {
            context.logger.debug(`Tagging ${destTags.length} image names: ${destTags.join(", ")}`);
        }

        const sourceTag = generator.workspaceConfig.test.docker.image;
        await tagImages(sourceTag, destTags, context);

        context.logger.info(`Successfully built and tagged docker image(s): ${destTags.join(", ")}`);
        context.logger.info(`Image(s) available in your local docker daemon.`);
    } catch (error) {
        context.logger.error(
            `Encountered error while building docker image. ${
                error instanceof Error ? (error.stack ?? error.message) : error
            }`
        );
        throw error;
    }
}

function getDockerBuildCommands(generator: GeneratorWorkspace): string[] {
    const dockerCommands =
        typeof generator.workspaceConfig.test.docker.command === "string"
            ? [generator.workspaceConfig.test.docker.command]
            : generator.workspaceConfig.test.docker.command;

    if (dockerCommands == null) {
        throw new Error(`Failed. No docker command for ${generator.workspaceName}`);
    }

    return dockerCommands;
}

async function buildWithSeedCommands(
    commands: string[],
    generator: GeneratorWorkspace,
    context: TaskContext
): Promise<void> {
    const { CONSOLE_LOGGER } = await import("@fern-api/logger");

    const dockerBuildReturn = await runScript({
        commands,
        logger: CONSOLE_LOGGER,
        workingDir: path.dirname(path.dirname(generator.absolutePathToWorkspace)),
        doNotPipeOutput: false
    });

    if (dockerBuildReturn.exitCode !== 0) {
        throw new Error(`Failed to build the docker container for ${generator.workspaceName}.`);
    }
}

function computeDestTags(generator: GeneratorWorkspace, version: string): string[] {
    const imageNames = [generator.workspaceConfig.image, ...(generator.workspaceConfig.imageAliases ?? [])];

    return imageNames.map((imageName) => {
        const lastColonIndex = imageName.lastIndexOf(":");
        if (lastColonIndex === -1) {
            return `${imageName}:${version}`;
        }

        const afterColon = imageName.substring(lastColonIndex + 1);
        if (afterColon.includes("/")) {
            return `${imageName}:${version}`;
        }

        const baseImageName = imageName.substring(0, lastColonIndex);
        return `${baseImageName}:${version}`;
    });
}

async function tagImages(sourceTag: string, destTags: string[], context: TaskContext): Promise<void> {
    const { CONSOLE_LOGGER } = await import("@fern-api/logger");

    for (const destTag of destTags) {
        context.logger.debug(`Tagging ${sourceTag} as ${destTag}...`);

        const tagResult = await runScript({
            commands: [`docker tag ${sourceTag} ${destTag}`],
            logger: CONSOLE_LOGGER,
            workingDir: process.cwd(),
            doNotPipeOutput: false
        });

        if (tagResult.exitCode !== 0) {
            throw new Error(`Failed to tag image ${sourceTag} as ${destTag}`);
        }
    }
}
