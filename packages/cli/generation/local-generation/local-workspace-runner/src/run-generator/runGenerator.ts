import { runDocker } from "@fern-api/docker-utils";
import { AbsoluteFilePath, waitUntilPathExists } from "@fern-api/fs-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { writeFile } from "fs/promises";
import {
    DOCKER_CODEGEN_OUTPUT_DIRECTORY,
    DOCKER_GENERATOR_CONFIG_PATH,
    DOCKER_PATH_TO_IR,
    DOCKER_PATH_TO_SNIPPET,
} from "./constants";
import { getGeneratorConfig } from "./getGeneratorConfig";

export declare namespace runGenerator {
    export interface Args {
        workspaceName: string;
        organization: string;

        absolutePathToIr: AbsoluteFilePath;
        absolutePathToOutput: AbsoluteFilePath;
        absolutePathToSnippet: AbsoluteFilePath | undefined;
        absolutePathToWriteConfigJson: AbsoluteFilePath;

        keepDocker: boolean;

        generatorInvocation: GeneratorInvocation;
    }
}

export async function runGenerator({
    workspaceName,
    organization,
    absolutePathToOutput,
    absolutePathToSnippet,
    absolutePathToIr,
    absolutePathToWriteConfigJson,
    keepDocker,
    generatorInvocation,
}: runGenerator.Args): Promise<void> {
    const { name, version, config: customConfig } = generatorInvocation;
    const imageName = `${name}:${version}`;

    const binds = [
        `${absolutePathToWriteConfigJson}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
        `${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`,
    ];
    if (absolutePathToSnippet !== undefined) {
        // TODO: Should this be returned as an element of "bindsForGenerators"?
        binds.push(`${absolutePathToSnippet}:${DOCKER_PATH_TO_SNIPPET}`);
    }
    const { config, binds: bindsForGenerators } = getGeneratorConfig({
        generatorInvocation,
        customConfig,
        workspaceName,
        organization,
        writeSnippets: absolutePathToSnippet !== undefined,
    });
    binds.push(...bindsForGenerators);

    await writeFile(
        absolutePathToWriteConfigJson,
        JSON.stringify(await FernGeneratorExecParsing.GeneratorConfig.json(config), undefined, 4)
    );

    const doesConfigJsonExist = await waitUntilPathExists(absolutePathToWriteConfigJson, 5_000);
    if (!doesConfigJsonExist) {
        throw new Error(`Failed to create ${absolutePathToWriteConfigJson}`);
    }

    await runDocker({
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker,
    });
}
