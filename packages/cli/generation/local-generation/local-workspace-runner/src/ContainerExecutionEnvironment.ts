import { ContainerRunner } from "@fern-api/core-utils";
import { runContainer } from "@fern-api/docker-utils";
import { CliError } from "@fern-api/task-context";
import {
    CONTAINER_CODEGEN_OUTPUT_DIRECTORY,
    CONTAINER_GENERATOR_CONFIG_PATH,
    CONTAINER_PATH_TO_IR,
    CONTAINER_PATH_TO_SNIPPET,
    CONTAINER_PATH_TO_SNIPPET_TEMPLATES,
    DEFAULT_NODE_DEBUG_PORT
} from "./constants.js";
import { ExecutionEnvironment } from "./ExecutionEnvironment.js";

export class ContainerExecutionEnvironment implements ExecutionEnvironment {
    public readonly usesContainerPaths = true;
    private readonly containerImage: string;
    private readonly keepContainer: boolean;
    private readonly runner?: ContainerRunner;
    private readonly disableTelemetry: boolean;

    constructor({
        containerImage,
        keepContainer,
        runner,
        disableTelemetry,
        dockerImage,
        keepDocker
    }: {
        containerImage?: string;
        keepContainer?: boolean;
        runner?: ContainerRunner;
        /** When true, disables telemetry collection inside the generator container. */
        disableTelemetry?: boolean;
        /** @deprecated Use containerImage instead */
        dockerImage?: string;
        /** @deprecated Use keepContainer instead */
        keepDocker?: boolean;
    }) {
        this.containerImage = containerImage ?? dockerImage ?? "";
        this.keepContainer = keepContainer ?? keepDocker ?? false;
        this.runner = runner;
        this.disableTelemetry = disableTelemetry ?? false;
    }

    public async execute({
        generatorName,
        irPath,
        configPath,
        outputPath,
        snippetPath,
        snippetTemplatePath,
        licenseFilePath,
        sourceMounts,
        context,
        inspect,
        runner
    }: ExecutionEnvironment.ExecuteArgs): Promise<void> {
        context.logger.info(`Executing generator ${generatorName} using container image: ${this.containerImage}`);

        const binds = [
            `${configPath}:${CONTAINER_GENERATOR_CONFIG_PATH}:ro`,
            `${irPath}:${CONTAINER_PATH_TO_IR}:ro`,
            `${outputPath}:${CONTAINER_CODEGEN_OUTPUT_DIRECTORY}`
        ];

        if (snippetPath) {
            binds.push(`${snippetPath}:${CONTAINER_PATH_TO_SNIPPET}`);
        }
        if (snippetTemplatePath) {
            binds.push(`${snippetTemplatePath}:${CONTAINER_PATH_TO_SNIPPET_TEMPLATES}`);
        }

        if (licenseFilePath) {
            binds.push(`${licenseFilePath}:/tmp/LICENSE:ro`);
        }

        for (const sourceMount of sourceMounts ?? []) {
            binds.push(`${sourceMount.hostPath}:${sourceMount.containerPath}:ro`);
        }

        const envVars: Record<string, string> = {};
        const ports: Record<string, string> = {};
        if (inspect) {
            envVars["NODE_OPTIONS"] = `--inspect-brk=0.0.0.0:${DEFAULT_NODE_DEBUG_PORT}`;
            ports[DEFAULT_NODE_DEBUG_PORT] = DEFAULT_NODE_DEBUG_PORT;
        }
        if (this.disableTelemetry) {
            envVars["FERN_DISABLE_TELEMETRY"] = "true";
        }

        try {
            await runContainer({
                logger: context.logger,
                imageName: this.containerImage,
                args: [CONTAINER_GENERATOR_CONFIG_PATH],
                binds,
                envVars,
                ports,
                removeAfterCompletion: !this.keepContainer,
                runner: this.runner ?? runner
            });
        } catch (error) {
            if (error instanceof CliError) {
                throw error;
            }
            throw new CliError({
                message: `Container execution failed: ${error instanceof Error ? error.message : String(error)}`,
                code: CliError.Code.ContainerError
            });
        }
    }
}
