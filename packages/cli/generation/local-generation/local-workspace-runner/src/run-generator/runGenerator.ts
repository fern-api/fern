import { runDocker } from "@fern-api/docker-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
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
        absolutePathToOutput: AbsoluteFilePath;
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
        `${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`,
    ];

    const { config, binds: bindsForGenerators } = getGeneratorConfig({
        customConfig,
        workspaceName,
        organization,
    });
    binds.push(...bindsForGenerators);

    await writeFile(
        absolutePathToWriteConfigJson,
        JSON.stringify(await FernGeneratorExecParsing.GeneratorConfig.json(config), undefined, 4)
    );

    // HACKHACK: sleep for 500ms to make sure dir is updated
    await new Promise((f) => setTimeout(f, 500));

    await runDocker({
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker,
    });
}
