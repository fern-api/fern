import { AbsoluteFilePath } from "@fern-api/core-utils";
import { runDocker } from "@fern-api/docker-utils";
import { writeFile } from "fs/promises";
import path from "path";
import { getGeneratorConfig } from "./getGeneratorConfig";

const DOCKER_FERN_DIRECTORY = "/fern";
const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, "output");
const DOCKER_GENERATOR_CONFIG_PATH = path.join(DOCKER_FERN_DIRECTORY, "config.json");
const DOCKER_PATH_TO_IR = path.join(DOCKER_FERN_DIRECTORY, "ir.json");

export declare namespace runGenerator {
    export interface Args {
        imageName: string;
        customConfig: unknown;
        workspaceName: string;
        organization: string;

        pathToIr: AbsoluteFilePath;
        pathToOutput: AbsoluteFilePath | undefined;
        pathToWriteConfigJson: AbsoluteFilePath;

        keepDocker: boolean;
    }
}

export async function runGenerator({
    imageName,
    workspaceName,
    organization,
    pathToOutput,
    pathToIr,
    pathToWriteConfigJson,
    customConfig,
    keepDocker,
}: runGenerator.Args): Promise<void> {
    const binds = [
        `${pathToWriteConfigJson}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
        `${pathToIr}:${DOCKER_PATH_TO_IR}:ro`,
    ];

    if (pathToOutput != null) {
        binds.push(`${pathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
    }

    const { config, binds: bindsForGenerators } = getGeneratorConfig({
        customConfig,
        workspaceName,
        organization,
    });
    binds.push(...bindsForGenerators);

    await writeFile(pathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    await runDocker({
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker,
    });
}
