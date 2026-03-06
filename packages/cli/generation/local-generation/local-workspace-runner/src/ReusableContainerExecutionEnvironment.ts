import { ContainerRunner } from "@fern-api/core-utils";
import {
    copyFromContainer,
    copyToContainer,
    execInContainer,
    startContainer,
    stopContainer
} from "@fern-api/docker-utils";
import { Logger } from "@fern-api/logger";
import {
    CONTAINER_CODEGEN_OUTPUT_DIRECTORY,
    CONTAINER_FERN_DIRECTORY,
    CONTAINER_GENERATOR_CONFIG_PATH,
    CONTAINER_PATH_TO_IR,
    CONTAINER_PATH_TO_SNIPPET,
    CONTAINER_PATH_TO_SNIPPET_TEMPLATES
} from "./constants.js";
import { ExecutionEnvironment } from "./ExecutionEnvironment.js";

/**
 * An execution environment that starts a long-lived container once and reuses it
 * across multiple generator executions. Instead of `docker run` per fixture,
 * files are copied in via `docker cp`, the generator is invoked via `docker exec`,
 * and output is copied back out.
 */
export class ReusableContainerExecutionEnvironment implements ExecutionEnvironment {
    public readonly usesContainerPaths = true;

    private containerId: string | undefined;
    private entrypoint: string[] | undefined;
    private readonly imageName: string;
    private readonly runner: ContainerRunner;

    constructor({ imageName, runner }: { imageName: string; runner?: ContainerRunner }) {
        this.imageName = imageName;
        this.runner = runner ?? "docker";
    }

    /**
     * Starts the long-lived container and inspects the image for its entrypoint.
     * Must be called before any `execute()` calls.
     */
    public async start(logger: Logger): Promise<void> {
        // Get the image entrypoint before starting (since we override it with /bin/sh)
        this.entrypoint = await this.getImageEntrypoint(logger);

        this.containerId = await startContainer({
            logger,
            imageName: this.imageName,
            runner: this.runner
        });

        logger.info(`Started reusable container ${this.containerId} from image ${this.imageName}`);
    }

    public async execute({
        irPath,
        configPath,
        outputPath,
        snippetPath,
        snippetTemplatePath,
        licenseFilePath,
        context
    }: ExecutionEnvironment.ExecuteArgs): Promise<void> {
        if (this.containerId == null || this.entrypoint == null) {
            throw new Error("Container not started. Call start() before execute().");
        }

        const logger = context.logger;
        const containerId = this.containerId;

        // Clean the output directory in the container for this fixture
        await execInContainer({
            logger,
            containerId,
            command: ["rm", "-rf", CONTAINER_CODEGEN_OUTPUT_DIRECTORY],
            runner: this.runner,
            writeLogsToFile: false
        });
        await execInContainer({
            logger,
            containerId,
            command: ["mkdir", "-p", CONTAINER_CODEGEN_OUTPUT_DIRECTORY],
            runner: this.runner,
            writeLogsToFile: false
        });

        // Ensure the /fern directory exists
        await execInContainer({
            logger,
            containerId,
            command: ["mkdir", "-p", CONTAINER_FERN_DIRECTORY],
            runner: this.runner,
            writeLogsToFile: false
        });

        // Copy input files into the container
        await copyToContainer({
            logger,
            containerId,
            hostPath: irPath,
            containerPath: CONTAINER_PATH_TO_IR,
            runner: this.runner
        });

        await copyToContainer({
            logger,
            containerId,
            hostPath: configPath,
            containerPath: CONTAINER_GENERATOR_CONFIG_PATH,
            runner: this.runner
        });

        if (snippetPath != null) {
            await copyToContainer({
                logger,
                containerId,
                hostPath: snippetPath,
                containerPath: CONTAINER_PATH_TO_SNIPPET,
                runner: this.runner
            });
        }

        if (snippetTemplatePath != null) {
            await copyToContainer({
                logger,
                containerId,
                hostPath: snippetTemplatePath,
                containerPath: CONTAINER_PATH_TO_SNIPPET_TEMPLATES,
                runner: this.runner
            });
        }

        if (licenseFilePath != null) {
            await copyToContainer({
                logger,
                containerId,
                hostPath: licenseFilePath,
                containerPath: "/tmp/LICENSE",
                runner: this.runner
            });
        }

        // Execute the generator inside the container using the image's original entrypoint
        await execInContainer({
            logger,
            containerId,
            command: [...this.entrypoint, CONTAINER_GENERATOR_CONFIG_PATH],
            runner: this.runner,
            writeLogsToFile: true
        });

        // Copy the output back to the host
        // Use "/fern/output/." to copy contents (not the directory itself)
        await copyFromContainer({
            logger,
            containerId,
            containerPath: `${CONTAINER_CODEGEN_OUTPUT_DIRECTORY}/.`,
            hostPath: outputPath,
            runner: this.runner
        });
    }

    /**
     * Stops and removes the long-lived container.
     */
    public async stop(logger: Logger): Promise<void> {
        if (this.containerId != null) {
            await stopContainer({
                logger,
                containerId: this.containerId,
                runner: this.runner
            });
            logger.info(`Stopped reusable container ${this.containerId}`);
            this.containerId = undefined;
        }
    }

    private async getImageEntrypoint(logger: Logger): Promise<string[]> {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        const { stdout } = await loggingExeca(
            logger,
            this.runner,
            ["inspect", "--format", "{{json .Config.Entrypoint}}", this.imageName],
            {
                reject: false,
                doNotPipeOutput: true
            }
        );

        try {
            const entrypoint = JSON.parse(stdout.trim());
            if (Array.isArray(entrypoint) && entrypoint.length > 0) {
                return entrypoint;
            }
        } catch {
            // Fall through to error
        }

        throw new Error(
            `Could not determine entrypoint for image ${this.imageName}. ` +
                `The image must have an ENTRYPOINT defined to be used with reusable containers.`
        );
    }
}
