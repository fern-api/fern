import { ContainerRunner } from "@fern-api/core-utils";
import {
    copyFromContainer,
    copyToContainer,
    execInContainer,
    startContainer,
    stopContainer
} from "@fern-api/docker-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
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
 * An execution environment that starts a pool of long-lived containers and reuses
 * them across multiple generator executions. Instead of `docker run` per fixture,
 * files are copied in via `docker cp`, the generator is invoked via `docker exec`,
 * and output is copied back out.
 *
 * The pool size controls how many fixtures can run in parallel. Each container in the
 * pool handles one fixture at a time, providing isolation without needing a mutex.
 */
export class ReusableContainerExecutionEnvironment implements ExecutionEnvironment {
    public readonly usesContainerPaths = true;

    private containers: string[] = [];
    private availableContainers: string[] = [];
    private waiters: Array<(containerId: string) => void> = [];
    private entrypoint: string[] | undefined;
    private readonly imageName: string;
    private readonly runner: ContainerRunner;
    private readonly poolSize: number;

    constructor({ imageName, runner, poolSize }: { imageName: string; runner?: ContainerRunner; poolSize?: number }) {
        this.imageName = imageName;
        this.runner = runner ?? "docker";
        this.poolSize = poolSize ?? 1;
    }

    /**
     * Starts the pool of long-lived containers and inspects the image for its entrypoint.
     * Must be called before any `execute()` calls.
     */
    public async start(logger: Logger): Promise<void> {
        // Get the image entrypoint before starting (since we override it with /bin/sh)
        this.entrypoint = await this.getImageEntrypoint(logger);

        // Start N containers in parallel
        const startPromises = [];
        for (let i = 0; i < this.poolSize; i++) {
            startPromises.push(
                startContainer({
                    logger,
                    imageName: this.imageName,
                    runner: this.runner
                })
            );
        }

        try {
            this.containers = await Promise.all(startPromises);
            this.availableContainers = [...this.containers];
        } catch (error) {
            // Clean up any containers that started successfully before the failure
            const settledPromises = await Promise.allSettled(startPromises);
            for (const result of settledPromises) {
                if (result.status === "fulfilled") {
                    await stopContainer({
                        logger,
                        containerId: result.value,
                        runner: this.runner
                    }).catch((cleanupErr) => {
                        logger.debug(`Best-effort cleanup failed for container ${result.value}: ${cleanupErr}`);
                    });
                }
            }
            this.containers = [];
            this.availableContainers = [];
            throw error;
        }

        logger.info(
            `Started ${this.containers.length} reusable container(s) from image ${this.imageName}: ${this.containers.map((id) => id.substring(0, 12)).join(", ")}`
        );
    }

    public async execute(args: ExecutionEnvironment.ExecuteArgs): Promise<void> {
        if (this.containers.length === 0 || this.entrypoint == null) {
            throw new Error("Containers not started. Call start() before execute().");
        }

        const containerId = await this.acquire();
        try {
            await this.doExecute(containerId, args);
        } finally {
            this.release(containerId);
        }
    }

    /**
     * Acquires a container from the pool, waiting if all are busy.
     */
    private acquire(): Promise<string> {
        const available = this.availableContainers.shift();
        if (available != null) {
            return Promise.resolve(available);
        }
        return new Promise<string>((resolve) => {
            this.waiters.push(resolve);
        });
    }

    /**
     * Releases a container back to the pool, waking up any waiters.
     */
    private release(containerId: string): void {
        const waiter = this.waiters.shift();
        if (waiter != null) {
            waiter(containerId);
        } else {
            this.availableContainers.push(containerId);
        }
    }

    private async doExecute(
        containerId: string,
        {
            irPath,
            configPath,
            outputPath,
            snippetPath,
            snippetTemplatePath,
            licenseFilePath,
            context,
            inspect
        }: ExecutionEnvironment.ExecuteArgs
    ): Promise<void> {
        if (inspect) {
            context.logger.warn(
                "--inspect is not supported with reusable containers (port mapping must be set at container start time). " +
                    "Use --local mode or the non-reusable container runner for debugging."
            );
        }
        if (this.entrypoint == null) {
            throw new Error("Containers not started. Call start() before execute().");
        }
        const entrypoint = this.entrypoint;
        const logger = context.logger;

        // Clean the entire /fern directory and /tmp/LICENSE to ensure no state leaks between fixtures.
        // This is critical — generators may write to any path under /fern (output, generators, sources, etc.)
        // and we need a fresh environment for each fixture.
        await execInContainer({
            logger,
            containerId,
            command: ["rm", "-rf", CONTAINER_FERN_DIRECTORY, "/tmp/LICENSE"],
            runner: this.runner,
            writeLogsToFile: false
        });

        // Recreate /fern and /fern/output
        await execInContainer({
            logger,
            containerId,
            command: ["mkdir", "-p", CONTAINER_CODEGEN_OUTPUT_DIRECTORY],
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
            command: [...entrypoint, CONTAINER_GENERATOR_CONFIG_PATH],
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

        // Copy snippet files back to the host (generators write these inside the container).
        // Unlike bind mounts in ContainerExecutionEnvironment, docker cp requires explicit copy-back.
        if (snippetPath != null) {
            await copyFromContainer({
                logger,
                containerId,
                containerPath: CONTAINER_PATH_TO_SNIPPET,
                hostPath: snippetPath,
                runner: this.runner
            }).catch((e: unknown) => {
                // Swallow "not found" errors — generator didn't produce snippet.
                // Propagate other errors (permissions, disk space, etc.).
                const msg = e instanceof Error ? e.message : String(e);
                if (msg.includes("No such container:path") || msg.includes("Could not find the file")) {
                    logger.debug(`Snippet file not found (expected): ${msg}`);
                } else {
                    throw e;
                }
            });
        }

        if (snippetTemplatePath != null) {
            await copyFromContainer({
                logger,
                containerId,
                containerPath: CONTAINER_PATH_TO_SNIPPET_TEMPLATES,
                hostPath: snippetTemplatePath,
                runner: this.runner
            }).catch((e: unknown) => {
                // Swallow "not found" errors — generator didn't produce snippet template.
                // Propagate other errors (permissions, disk space, etc.).
                const msg = e instanceof Error ? e.message : String(e);
                if (msg.includes("No such container:path") || msg.includes("Could not find the file")) {
                    logger.debug(`Snippet template file not found (expected): ${msg}`);
                } else {
                    throw e;
                }
            });
        }
    }

    /**
     * Stops and removes all containers in the pool.
     */
    public async stop(logger: Logger): Promise<void> {
        const stopPromises = this.containers.map(async (containerId) => {
            await stopContainer({
                logger,
                containerId,
                runner: this.runner
            });
        });
        await Promise.all(stopPromises);
        logger.info(
            `Stopped ${this.containers.length} reusable container(s): ${this.containers.map((id) => id.substring(0, 12)).join(", ")}`
        );
        this.containers = [];
        this.availableContainers = [];
    }

    private async getImageEntrypoint(logger: Logger): Promise<string[]> {
        const { stdout, stderr, exitCode } = await loggingExeca(
            logger,
            this.runner,
            ["inspect", "--format", "{{json .Config.Entrypoint}}", this.imageName],
            {
                reject: false,
                doNotPipeOutput: true
            }
        );

        if (exitCode !== 0) {
            throw new Error(`Failed to inspect image ${this.imageName} (exit code ${exitCode}).\n${stderr || stdout}`);
        }

        try {
            const entrypoint = JSON.parse(stdout.trim());
            if (Array.isArray(entrypoint) && entrypoint.length > 0) {
                return entrypoint;
            }
        } catch (e) {
            logger.warn(`Failed to parse entrypoint for image ${this.imageName}: ${e}`);
        }

        throw new Error(
            `Could not determine entrypoint for image ${this.imageName}. ` +
                `The image must have an ENTRYPOINT defined to be used with reusable containers.`
        );
    }
}
