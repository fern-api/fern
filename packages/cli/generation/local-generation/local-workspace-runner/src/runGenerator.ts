import { Audiences, generatorsYml } from "@fern-api/configuration";
import { runDocker } from "@fern-api/docker-utils";
import { AbsoluteFilePath, waitUntilPathExists } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { cp, mkdir, writeFile } from "fs/promises";
import tmp, { DirectoryResult } from "tmp-promise";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_GENERATOR_CONFIG_PATH, DOCKER_PATH_TO_IR } from "./constants";
import { getGeneratorConfig } from "./getGeneratorConfig";
import { getIntermediateRepresentation } from "./getIntermediateRepresentation";
import { LocalTaskHandler } from "./LocalTaskHandler";

export interface GeneratorRunResponse {
    /* Path to the generated IR */
    absolutePathToIr: AbsoluteFilePath;
    /* Path to the generated config.json */
    absolutePathToConfigJson: AbsoluteFilePath;
}

export async function writeFilesToDiskAndRunGenerator({
    organization,
    workspace,
    generatorInvocation,
    absolutePathToLocalOutput,
    absolutePathToFernConfig,
    audiences,
    workspaceTempDir,
    keepDocker,
    context,
    irVersionOverride,
    outputVersionOverride,
    writeSnippets,
    writeUnitTests
}: {
    organization: string;
    workspace: FernWorkspace;
    audiences: Audiences;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    absolutePathToLocalOutput: AbsoluteFilePath;
    workspaceTempDir: DirectoryResult;
    keepDocker: boolean;
    context: TaskContext;
    irVersionOverride: string | undefined;
    outputVersionOverride: string | undefined;
    writeSnippets: boolean;
    writeUnitTests: boolean;
}): Promise<GeneratorRunResponse> {
    const absolutePathToIr = await writeIrToFile({
        workspace,
        audiences,
        generatorInvocation,
        workspaceTempDir,
        context,
        irVersionOverride
    });
    context.logger.debug("Wrote IR to: " + absolutePathToIr);

    const configJsonFile = await tmp.file({
        tmpdir: workspaceTempDir.path
    });
    const absolutePathToWriteConfigJson = AbsoluteFilePath.of(configJsonFile.path);
    context.logger.debug("Will write config.json to: " + absolutePathToWriteConfigJson);

    const tmpOutputDirectory = await tmp.dir({
        tmpdir: workspaceTempDir.path
    });
    const absolutePathToTmpOutputDirectory = AbsoluteFilePath.of(tmpOutputDirectory.path);
    context.logger.debug("Will write output to: " + absolutePathToTmpOutputDirectory);

    const absolutePathToFernDefinition = workspace.definition.absoluteFilepath;

    let absolutePathToTmpSnippetJSON = undefined;
    if (writeSnippets) {
        const snippetJsonFile = await tmp.file({
            tmpdir: workspaceTempDir.path
        });
        absolutePathToTmpSnippetJSON = AbsoluteFilePath.of(snippetJsonFile.path);
        context.logger.debug("Will write snippet.json to: " + absolutePathToTmpSnippetJSON);
    }

    if (writeUnitTests) {
        context.logger.debug("Will write .mock to: " + absolutePathToTmpOutputDirectory);

        await writeDotMock({
            absolutePathToDotMockDirectory: absolutePathToTmpOutputDirectory,
            absolutePathToFernDefinition,
            absolutePathToFernConfig
        });
    }

    await runGenerator({
        absolutePathToOutput: absolutePathToTmpOutputDirectory,
        absolutePathToSnippet: absolutePathToTmpSnippetJSON,
        absolutePathToIr,
        absolutePathToWriteConfigJson,
        workspaceName: workspace.name,
        organization,
        outputVersion: outputVersionOverride,
        keepDocker,
        generatorInvocation,
        context,
        writeUnitTests
    });

    const taskHandler = new LocalTaskHandler({
        context,
        absolutePathToLocalOutput,
        absolutePathToTmpOutputDirectory,
        absolutePathToTmpSnippetJSON
    });
    await taskHandler.copyGeneratedFiles();

    return {
        absolutePathToIr,
        absolutePathToConfigJson: absolutePathToWriteConfigJson
    };
}

async function writeIrToFile({
    workspace,
    audiences,
    generatorInvocation,
    workspaceTempDir,
    context,
    irVersionOverride
}: {
    workspace: FernWorkspace;
    audiences: Audiences;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    context: TaskContext;
    irVersionOverride: string | undefined;
}): Promise<AbsoluteFilePath> {
    const intermediateRepresentation = await getIntermediateRepresentation({
        workspace,
        audiences,
        generatorInvocation,
        context,
        irVersionOverride
    });
    context.logger.debug("Migrated IR");
    const irFile = await tmp.file({
        tmpdir: workspaceTempDir.path
    });
    const absolutePathToIr = AbsoluteFilePath.of(irFile.path);
    await writeFile(absolutePathToIr, JSON.stringify(intermediateRepresentation, undefined, 4));
    context.logger.debug(`Wrote IR to ${absolutePathToIr}`);
    return absolutePathToIr;
}

// Copy Fern definition to output directory
async function writeDotMock({
    absolutePathToDotMockDirectory,
    absolutePathToFernDefinition,
    absolutePathToFernConfig
}: {
    absolutePathToDotMockDirectory: AbsoluteFilePath;
    absolutePathToFernDefinition: AbsoluteFilePath | undefined;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
}): Promise<void> {
    if (absolutePathToFernDefinition != null) {
        await cp(`${absolutePathToFernDefinition}`, `${absolutePathToDotMockDirectory}/.mock/definition`, {
            recursive: true
        });
    }
    if (absolutePathToFernConfig != null) {
        // Copy Fern config
        await cp(`${absolutePathToFernConfig}`, `${absolutePathToDotMockDirectory}/.mock`);
    } else if (absolutePathToFernDefinition != null) {
        // If for whatever reason we don't have the fern config, just write a dummy ones
        await mkdir(`${absolutePathToDotMockDirectory}/.mock`, { recursive: true });
        await writeFile(
            `${absolutePathToDotMockDirectory}/.mock/fern.config.json`,
            '{"organization": "fern-test", "version": "0.19.0"}'
        );
    }
}

export declare namespace runGenerator {
    export interface Args {
        workspaceName: string;
        organization: string;
        outputVersion?: string | undefined;

        absolutePathToIr: AbsoluteFilePath;
        absolutePathToOutput: AbsoluteFilePath;
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
    absolutePathToSnippet,
    absolutePathToIr,
    absolutePathToWriteConfigJson,
    keepDocker,
    generatorInvocation,
    writeUnitTests
}: runGenerator.Args): Promise<void> {
    const { name, version, config: customConfig } = generatorInvocation;
    const imageName = `${name}:${version}`;

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
