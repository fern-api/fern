import { writeFile } from "fs/promises";
import tmp, { DirectoryResult } from "tmp-promise";

import { Audiences, generatorsYml } from "@fern-api/configuration";
import { runDocker } from "@fern-api/docker-utils";
import { AbsoluteFilePath, streamObjectToFile, waitUntilPathExists } from "@fern-api/fs-utils";
import { ApiDefinitionSource, IntermediateRepresentation, SourceConfig } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, IdentifiableSource } from "@fern-api/workspace-loader";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as FernGeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";

import { LocalTaskHandler } from "./LocalTaskHandler";
import {
    DOCKER_CODEGEN_OUTPUT_DIRECTORY,
    DOCKER_GENERATOR_CONFIG_PATH,
    DOCKER_PATH_TO_IR,
    DOCKER_SOURCES_DIRECTORY
} from "./constants";
import { getGeneratorConfig } from "./getGeneratorConfig";
import { getIntermediateRepresentation } from "./getIntermediateRepresentation";

export interface GeneratorRunResponse {
    ir: IntermediateRepresentation;
    generatorConfig: FernGeneratorExec.GeneratorConfig;
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
    generatePaginatedClients,
    includeOptionalRequestPropertyExamples
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
    includeOptionalRequestPropertyExamples?: boolean;
}): Promise<GeneratorRunResponse> {
    const { latest, migrated } = await getIntermediateRepresentation({
        workspace,
        audiences,
        generatorInvocation,
        context,
        irVersionOverride,
        packageName: generatorsYml.getPackageName({ generatorInvocation }),
        version: outputVersionOverride,
        sourceConfig: getSourceConfig(workspace),
        includeOptionalRequestPropertyExamples
    });
    const absolutePathToIr = await writeIrToFile({
        workspaceTempDir,
        context,
        ir: migrated
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

    const { generatorConfig } = await runGenerator({
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
        generatePaginatedClients,
        sources: workspace.getSources()
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
        absolutePathToConfigJson: absolutePathToWriteConfigJson,
        ir: latest,
        generatorConfig
    };
}

async function writeIrToFile({
    ir,
    workspaceTempDir,
    context
}: {
    ir: unknown;
    workspaceTempDir: DirectoryResult;
    context: TaskContext;
}): Promise<AbsoluteFilePath> {
    context.logger.debug("Migrated IR");
    const irFile = await tmp.file({
        tmpdir: workspaceTempDir.path
    });
    const absolutePathToIr = AbsoluteFilePath.of(irFile.path);
    await streamObjectToFile(absolutePathToIr, ir, { pretty: false });
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
        sources: IdentifiableSource[];
    }

    export interface Return {
        generatorConfig: FernGeneratorExec.GeneratorConfig;
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
    context,
    generatorInvocation,
    writeUnitTests,
    generateOauthClients,
    generatePaginatedClients,
    sources
}: runGenerator.Args): Promise<runGenerator.Return> {
    const { name, version, config: customConfig } = generatorInvocation;
    const imageName = `${name}:${version}`;

    const binds = [
        `${absolutePathToWriteConfigJson}:${DOCKER_GENERATOR_CONFIG_PATH}:ro`,
        `${absolutePathToIr}:${DOCKER_PATH_TO_IR}:ro`,
        `${absolutePathToOutput}:${DOCKER_CODEGEN_OUTPUT_DIRECTORY}`
    ];
    for (const source of sources) {
        binds.push(`${source.absoluteFilePath}:${getDockerDestinationForSource(source)}:ro`);
    }

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
        logger: context.logger,
        imageName,
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: !keepDocker
    });

    return {
        generatorConfig: config
    };
}

function getSourceConfig(workspace: FernWorkspace): SourceConfig {
    return {
        sources: workspace.getSources().map((source) => {
            if (source.type === "protobuf") {
                return ApiDefinitionSource.proto({
                    id: source.id,
                    protoRootUrl: `file:///${getDockerDestinationForSource(source)}`
                });
            }
            return ApiDefinitionSource.openapi();
        })
    };
}

function getDockerDestinationForSource(source: IdentifiableSource): string {
    return `${DOCKER_SOURCES_DIRECTORY}/${source.id}`;
}
