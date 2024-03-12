import { generatorsYml } from "@fern-api/configuration";
import { runDocker } from "@fern-api/docker-utils";
import { AbsoluteFilePath, waitUntilPathExists } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { cp, mkdirSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_GENERATOR_CONFIG_PATH, DOCKER_PATH_TO_IR } from "./constants";
import { getGeneratorConfig } from "./getGeneratorConfig";

export declare namespace runGenerator {
    export interface Args {
        workspaceName: string;
        organization: string;
        outputVersion?: string | undefined;

        absolutePathToIr: AbsoluteFilePath;
        absolutePathToOutput: AbsoluteFilePath;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        absolutePathToFernDefinition: AbsoluteFilePath | undefined;
        absolutePathToSnippet: AbsoluteFilePath | undefined;
        absolutePathToWriteConfigJson: AbsoluteFilePath;
        keepDocker: boolean;
        context: TaskContext;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        writeUnitTests: boolean;
    }
}

export async function runGenerator({
    workspaceName,
    organization,
    outputVersion,
    absolutePathToOutput,
    absolutePathToFernDefinition,
    absolutePathToFernConfig,
    absolutePathToSnippet,
    absolutePathToIr,
    absolutePathToWriteConfigJson,
    keepDocker,
    generatorInvocation,
    context,
    writeUnitTests
}: runGenerator.Args): Promise<void> {
    const { name, version, config: customConfig } = generatorInvocation;
    const imageName = `${name}:${version}`;

    // Copy Fern definition to output directory
    if (writeUnitTests && (generatorInvocation.outputMode.type ?? "").startsWith("github")) {
        if (absolutePathToFernDefinition != null) {
            cp(
                `${absolutePathToFernDefinition}`,
                `${absolutePathToOutput}/.mock/definition`,
                { recursive: true },
                (err) => {
                    if (err) {
                        context.logger.error(`Failed to copy Fern definition to output directory: ${err.message}`);
                    }
                }
            );
        }
        if (absolutePathToFernConfig != null) {
            // Copy Fern config
            cp(`${absolutePathToFernConfig}`, `${absolutePathToOutput}/.mock`, (err) => {
                if (err) {
                    context.logger.error(`Failed to copy Fern config to output directory: ${err.message}`);
                }
            });
        } else if (absolutePathToFernDefinition != null) {
            // If for whatever reason we don't have the fern config, just write a dummy ones
            mkdirSync(`${absolutePathToOutput}/.mock`, { recursive: true });
            writeFileSync(
                `${absolutePathToOutput}/.mock/fern.config.json`,
                '{"organization": "fern-test", "version": "0.19.0"}'
            );
        }
    }
    const binds = [
        `${absolutePathToWriteConfigJson}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
        `${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`
    ];
    const { config, binds: bindsForGenerators } = getGeneratorConfig({
        generatorInvocation,
        customConfig,
        workspaceName,
        outputVersion,
        organization,
        absolutePathToSnippet,
        writeUnitTests
    });
    binds.push(...bindsForGenerators);

    const parsedConfig = await FernGeneratorExecParsing.GeneratorConfig.json(config);
    if (!parsedConfig.ok) {
        throw new Error(`Failed to parse config.json into ${absolutePathToWriteConfigJson}`);
    }

    await writeFile(absolutePathToWriteConfigJson, JSON.stringify(parsedConfig.value, undefined, 4));

    const doesConfigJsonExist = await waitUntilPathExists(absolutePathToWriteConfigJson, 5_000);
    if (!doesConfigJsonExist) {
        throw new Error(`Failed to create ${absolutePathToWriteConfigJson}`);
    }

    await runDocker({
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker
    });
}
