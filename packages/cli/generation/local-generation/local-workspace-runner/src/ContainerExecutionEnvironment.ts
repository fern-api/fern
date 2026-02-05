import { ContainerRunner } from "@fern-api/core-utils";
import { runContainer } from "@fern-api/docker-utils";
import {
    CONTAINER_CODEGEN_OUTPUT_DIRECTORY,
    CONTAINER_GENERATOR_CONFIG_PATH,
    CONTAINER_PATH_TO_IR,
    CONTAINER_PATH_TO_SNIPPET,
    CONTAINER_PATH_TO_SNIPPET_TEMPLATES,
    DEFAULT_NODE_DEBUG_PORT
} from "./constants";
import { ExecutionEnvironment } from "./ExecutionEnvironment";

export class ContainerExecutionEnvironment implements ExecutionEnvironment {
    private readonly containerImage: string;
    private readonly keepContainer: boolean;
    private readonly runner?: ContainerRunner;

    constructor({
        containerImage,
        keepContainer,
        runner,
        dockerImage,
        keepDocker
    }: {
        containerImage?: string;
        keepContainer?: boolean;
        runner?: ContainerRunner;
        /** @deprecated Use containerImage instead */
        dockerImage?: string;
        /** @deprecated Use keepContainer instead */
        keepDocker?: boolean;
    }) {
        this.containerImage = containerImage ?? dockerImage ?? "";
        this.keepContainer = keepContainer ?? keepDocker ?? false;
        this.runner = runner;
    }

    public async execute({
        generatorName,
        irPath,
        configPath,
        outputPath,
        snippetPath,
        snippetTemplatePath,
        licenseFilePath,
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

        const envVars: Record<string, string> = {};
        const ports: Record<string, string> = {};
        if (inspect) {
            envVars["NODE_OPTIONS"] = `--inspect-brk=0.0.0.0:${DEFAULT_NODE_DEBUG_PORT}`;
            ports[DEFAULT_NODE_DEBUG_PORT] = DEFAULT_NODE_DEBUG_PORT;
        }

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
    }
}
