import { AbsoluteFilePath } from "@fern-api/core-utils";
import { runDocker } from "@fern-api/docker-utils";
import { writeFile } from "fs/promises";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_GENERATOR_CONFIG_PATH, DOCKER_PATH_TO_IR } from "./constants";
import { getGeneratorConfig } from "./getGeneratorConfig";

export declare namespace runGenerator {
    export interface Args {
        imageName: string;
        customConfig: unknown;
        workspaceName: string;
        organization: string;

        absolutePathToIr: AbsoluteFilePath;
        absolutePathToOutput: AbsoluteFilePath | undefined;
        absolutePathToWriteConfigJson: AbsoluteFilePath;

        keepDocker: boolean;
    }
}

export async function runGenerator({
    imageName,
    workspaceName,
    organization,
    absolutePathToOutput,
    absolutePathToIr,
    absolutePathToWriteConfigJson,
    customConfig,
    keepDocker,
}: runGenerator.Args): Promise<void> {
    const binds = [
        `${absolutePathToWriteConfigJson}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
    ];

    if (absolutePathToOutput != null) {
        binds.push(`${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`);
    }

    const { config, binds: bindsForGenerators } = getGeneratorConfig({
        customConfig,
        workspaceName,
        organization,
    });
    binds.push(...bindsForGenerators);

    await writeFile(absolutePathToWriteConfigJson, JSON.stringify(config, undefined, 4));

    await runDocker({
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker,
    });
}
