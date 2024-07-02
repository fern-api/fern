import { Audiences, generatorsYml } from "@fern-api/configuration";
import { runDocker } from "@fern-api/docker-utils";
import { AbsoluteFilePath, waitUntilPathExists } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { writeFile } from "fs/promises";
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
    absolutePathToLocalSnippetJSON,
    absolutePathToLocalSnippetTemplateJSON,
    absolutePathToFernConfig,
    audiences,
    workspaceTempDir,
    keepDocker,
    context,
    irVersionOverride,
    outputVersionOverride,
    writeUnitTests,
    generateOauthClients,
    generatePaginatedClients
}: {
    organization: string;
    workspace: FernWorkspace;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    absolutePathToLocalOutput: AbsoluteFilePath;
    absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined;
    absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath | undefined;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
    audiences: Audiences;
    workspaceTempDir: DirectoryResult;
    keepDocker: boolean;
    context: TaskContext;
    irVersionOverride: string | undefined;
    outputVersionOverride: string | undefined;
    writeUnitTests: boolean;
    generateOauthClients: boolean;
    generatePaginatedClients: boolean;
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
    if (absolutePathToLocalSnippetJSON != null) {
        const snippetJsonFile = await tmp.file({
            tmpdir: workspaceTempDir.path
        });
        absolutePathToTmpSnippetJSON = AbsoluteFilePath.of(snippetJsonFile.path);
        context.logger.debug("Will write snippet.json to: " + absolutePathToTmpSnippetJSON);
    }

    let absolutePathToTmpSnippetTemplatesJSON = undefined;
    if (absolutePathToLocalSnippetTemplateJSON != null) {
        const snippetTemplatesJsonFile = await tmp.file({
            tmpdir: workspaceTempDir.path
        });
        absolutePathToTmpSnippetTemplatesJSON = AbsoluteFilePath.of(snippetTemplatesJsonFile.path);
        context.logger.debug("Will write snippet-templates.json to: " + absolutePathToTmpSnippetTemplatesJSON);
    }

    await runGenerator({
        absolutePathToOutput: absolutePathToTmpOutputDirectory,
        absolutePathToSnippet: absolutePathToTmpSnippetJSON,
        absolutePathToSnippetTemplates: absolutePathToTmpSnippetTemplatesJSON,
        absolutePathToIr,
        absolutePathToWriteConfigJson,
        workspaceName: workspace.definition.rootApiFile.contents.name,
        organization,
        outputVersion: outputVersionOverride,
        keepDocker,
        generatorInvocation,
        context,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients
    });

    const taskHandler = new LocalTaskHandler({
        context,
        absolutePathToLocalOutput,
        absolutePathToTmpOutputDirectory,
        absolutePathToLocalSnippetJSON,
        absolutePathToLocalSnippetTemplateJSON,
        absolutePathToTmpSnippetJSON,
        absolutePathToTmpSnippetTemplatesJSON
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

export declare namespace runGenerator {
    export interface Args {
        workspaceName: string;
        organization: string;
        outputVersion?: string | undefined;

        absolutePathToIr: AbsoluteFilePath;
        absolutePathToOutput: AbsoluteFilePath;
        absolutePathToSnippet: AbsoluteFilePath | undefined;
        absolutePathToSnippetTemplates: AbsoluteFilePath | undefined;
        absolutePathToWriteConfigJson: AbsoluteFilePath;
        keepDocker: boolean;
        context: TaskContext;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        writeUnitTests: boolean;
        generateOauthClients: boolean;
        generatePaginatedClients: boolean;
    }
}

export async function runGenerator({
    workspaceName,
    organization,
    outputVersion,
    absolutePathToOutput,
    absolutePathToSnippet,
    absolutePathToSnippetTemplates,
    absolutePathToIr,
    absolutePathToWriteConfigJson,
    keepDocker,
    generatorInvocation,
    writeUnitTests,
    generateOauthClients,
    generatePaginatedClients
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
        absolutePathToSnippetTemplates,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients
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
