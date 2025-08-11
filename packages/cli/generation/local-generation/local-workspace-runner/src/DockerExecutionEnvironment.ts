import { runDocker } from "@fern-api/docker-utils";

import { ExecutionEnvironment } from "./ExecutionEnvironment";
import {
    DOCKER_CODEGEN_OUTPUT_DIRECTORY,
    DOCKER_GENERATOR_CONFIG_PATH,
    DOCKER_PATH_TO_IR,
    DOCKER_PATH_TO_SNIPPET,
    DOCKER_PATH_TO_SNIPPET_TEMPLATES,
    DEFAULT_NODE_DEBUG_PORT
} from "./constants";

export class DockerExecutionEnvironment implements ExecutionEnvironment {
    private readonly dockerImage: string;
    private readonly keepDocker: boolean;

    constructor({ dockerImage, keepDocker }: { dockerImage: string; keepDocker: boolean }) {
        this.dockerImage = dockerImage;
        this.keepDocker = keepDocker;
    }

    public async execute({
        generatorName,
        irPath,
        configPath,
        outputPath,
        snippetPath,
        snippetTemplatePath,
        context,
        inspect,
        runner
    }: ExecutionEnvironment.ExecuteArgs): Promise<void> {
        context.logger.info(`Executing generator ${generatorName} using Docker image: ${this.dockerImage}`);

        const binds = [
            `${configPath}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
            `${irPath}:${DOCKER_PATH_TO_IR}:ro`,
            `${outputPath}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`
        ];

        if (snippetPath) {
            binds.push(`${snippetPath}:${DOCKER_PATH_TO_SNIPPET}`);
        }
        if (snippetTemplatePath) {
            binds.push(`${snippetTemplatePath}:${DOCKER_PATH_TO_SNIPPET_TEMPLATES}`);
        }

        const envVars: Record<string, string> = {};
        const ports: Record<string, string> = {};
        if (inspect) {
            envVars["NODE_OPTIONS"] = `--inspect-brk=0.0.0.0:${DEFAULT_NODE_DEBUG_PORT}`;
            ports[DEFAULT_NODE_DEBUG_PORT] = DEFAULT_NODE_DEBUG_PORT;
        }

        await runDocker({
            logger: context.logger,
            imageName: this.dockerImage,
            args: [DOCKER_GENERATOR_CONFIG_PATH],
            binds,
            envVars,
            ports,
            removeAfterCompletion: !this.keepDocker,
            runner
        });
    }
}
