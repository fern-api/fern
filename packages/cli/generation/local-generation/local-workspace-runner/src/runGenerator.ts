import { writeFile, mkdir } from "fs/promises";
import tmp, { DirectoryResult } from "tmp-promise";

import { Audiences, generatorsYml, SNIPPET_TEMPLATES_JSON_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, streamObjectToFile } from "@fern-api/fs-utils";
import { ApiDefinitionSource, IntermediateRepresentation, SourceConfig } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, IdentifiableSource } from "@fern-api/workspace-loader";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { LocalTaskHandler } from "./LocalTaskHandler";
import {
    CODEGEN_OUTPUT_DIRECTORY_NAME,
    DOCKER_SOURCES_DIRECTORY,
    IR_FILENAME,
    GENERATOR_CONFIG_FILENAME,
    DOCKER_CODEGEN_OUTPUT_DIRECTORY,
    DOCKER_PATH_TO_IR,
    DOCKER_PATH_TO_SNIPPET,
    DOCKER_PATH_TO_SNIPPET_TEMPLATES,
    DOCKER_GENERATOR_CONFIG_PATH
} from "./constants";
import { getGeneratorConfig } from "./getGeneratorConfig";
import { getIntermediateRepresentation } from "./getIntermediateRepresentation";
import { ExecutionEnvironment } from "./ExecutionEnvironment";
import { DockerExecutionEnvironment } from "./DockerExecutionEnvironment";
import { GeneratorConfig } from "@fern-fern/generator-exec-sdk/serialization";
import { join } from "path";

export interface GeneratorRunResponse {
    ir: IntermediateRepresentation;
    generatorConfig: FernGeneratorExec.GeneratorConfig;
    absolutePathToIr: AbsoluteFilePath;
    absolutePathToConfigJson: AbsoluteFilePath;
}

export async function writeFilesToDiskAndRunGenerator({
    organization,
    absolutePathToFernConfig,
    workspace,
    generatorInvocation,
    absolutePathToLocalOutput,
    absolutePathToLocalSnippetJSON,
    absolutePathToLocalSnippetTemplateJSON,
    audiences,
    version,
    workspaceTempDir,
    keepDocker,
    context,
    irVersionOverride,
    outputVersionOverride,
    writeUnitTests,
    generateOauthClients,
    generatePaginatedClients,
    includeOptionalRequestPropertyExamples,
    inspect,
    executionEnvironment,
    ir
}: {
    organization: string;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
    workspace: FernWorkspace;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    absolutePathToLocalOutput: AbsoluteFilePath;
    absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined;
    absolutePathToLocalSnippetTemplateJSON: AbsoluteFilePath | undefined;
    audiences: Audiences;
    workspaceTempDir: tmp.DirectoryResult;
    keepDocker: boolean;
    context: TaskContext;
    irVersionOverride: string | undefined;
    outputVersionOverride: string | undefined;
    writeUnitTests: boolean;
    generateOauthClients: boolean;
    generatePaginatedClients: boolean;
    includeOptionalRequestPropertyExamples: boolean;
    inspect: boolean;
    executionEnvironment?: ExecutionEnvironment;
    ir: IntermediateRepresentation;
}): Promise<{ ir: IntermediateRepresentation; generatorConfig: FernGeneratorExec.GeneratorConfig }> {
    const { latest, migrated } = await getIntermediateRepresentation({
        workspace,
        audiences,
        generatorInvocation,
        context,
        irVersionOverride,
        packageName: generatorsYml.getPackageName({ generatorInvocation }),
        version: version ?? outputVersionOverride,
        sourceConfig: getSourceConfig(workspace),
        includeOptionalRequestPropertyExamples,
        ir
    });

    const absolutePathToIr = await writeIrToFile({
        workspaceTempDir,
        filename: IR_FILENAME,
        context,
        ir: migrated // Use migrated version for file writing
    });
    context.logger.debug("Wrote IR to: " + absolutePathToIr);

    const configJsonFile = join(workspaceTempDir.path, GENERATOR_CONFIG_FILENAME);
    const absolutePathToWriteConfigJson = AbsoluteFilePath.of(configJsonFile);
    await writeFile(configJsonFile, "");
    context.logger.debug("Will write config.json to: " + absolutePathToWriteConfigJson);

    const tmpOutputDirectory = join(workspaceTempDir.path, CODEGEN_OUTPUT_DIRECTORY_NAME);
    const absolutePathToTmpOutputDirectory = AbsoluteFilePath.of(tmpOutputDirectory);
    await mkdir(tmpOutputDirectory, { recursive: true });
    context.logger.debug("Will write output to: " + absolutePathToTmpOutputDirectory);

    let absolutePathToTmpSnippetJSON = undefined;
    if (absolutePathToLocalSnippetJSON != null) {
        const snippetJsonFile = join(workspaceTempDir.path, "snippet.json");
        absolutePathToTmpSnippetJSON = AbsoluteFilePath.of(snippetJsonFile);
        await writeFile(snippetJsonFile, "");
        context.logger.debug("Will write snippet.json to: " + absolutePathToTmpSnippetJSON);
    }

    let absolutePathToTmpSnippetTemplatesJSON = undefined;
    if (absolutePathToLocalSnippetTemplateJSON != null) {
        const snippetTemplatesJsonFile = join(workspaceTempDir.path, SNIPPET_TEMPLATES_JSON_FILENAME);
        absolutePathToTmpSnippetTemplatesJSON = AbsoluteFilePath.of(snippetTemplatesJsonFile);
        await writeFile(snippetTemplatesJsonFile, "");
        context.logger.debug("Will write snippet-templates.json to: " + absolutePathToTmpSnippetTemplatesJSON);
    }

    const environment =
        executionEnvironment ??
        new DockerExecutionEnvironment({
            dockerImage: `${generatorInvocation.name}:${generatorInvocation.version}`,
            keepDocker
        });

    const isDocker = environment instanceof DockerExecutionEnvironment;
    const paths = isDocker
        ? ({
              outputDirectory: AbsoluteFilePath.of(DOCKER_CODEGEN_OUTPUT_DIRECTORY),
              irPath: AbsoluteFilePath.of(DOCKER_PATH_TO_IR),
              configPath: AbsoluteFilePath.of(DOCKER_GENERATOR_CONFIG_PATH),
              snippetPath: AbsoluteFilePath.of(DOCKER_PATH_TO_SNIPPET),
              snippetTemplatePath: AbsoluteFilePath.of(DOCKER_PATH_TO_SNIPPET_TEMPLATES)
          } as const)
        : ({
              outputDirectory: absolutePathToTmpOutputDirectory,
              configPath: absolutePathToWriteConfigJson,
              irPath: absolutePathToIr,
              snippetPath: absolutePathToTmpSnippetJSON,
              snippetTemplatePath: absolutePathToTmpSnippetTemplatesJSON
          } as const);

    const config = getGeneratorConfig({
        generatorInvocation,
        customConfig: generatorInvocation.config,
        workspaceName: workspace.definition.rootApiFile.contents.name,
        outputVersion: outputVersionOverride,
        organization,
        absolutePathToSnippet: absolutePathToTmpSnippetJSON,
        absolutePathToSnippetTemplates: absolutePathToTmpSnippetTemplatesJSON,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients,
        paths
    });

    await writeFile(
        absolutePathToWriteConfigJson,
        JSON.stringify(await GeneratorConfig.jsonOrThrow(config), undefined, 4)
    );

    await environment.execute({
        generatorName: generatorInvocation.name,
        irPath: absolutePathToIr,
        configPath: absolutePathToWriteConfigJson,
        outputPath: absolutePathToTmpOutputDirectory,
        snippetPath: absolutePathToTmpSnippetJSON,
        snippetTemplatePath: absolutePathToTmpSnippetTemplatesJSON,
        context,
        inspect
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
        ir: latest,
        generatorConfig: config
    };
}

async function writeIrToFile({
    ir,
    workspaceTempDir,
    filename,
    context
}: {
    ir: unknown;
    workspaceTempDir: DirectoryResult;
    filename?: string;
    context: TaskContext;
}): Promise<AbsoluteFilePath> {
    context.logger.debug("Migrated IR");
    let absolutePathToIr: AbsoluteFilePath;
    if (filename) {
        absolutePathToIr = AbsoluteFilePath.of(join(workspaceTempDir.path, filename));
    } else {
        const irFile = await tmp.file({
            tmpdir: workspaceTempDir.path
        });
        absolutePathToIr = AbsoluteFilePath.of(irFile.path);
    }
    await streamObjectToFile(absolutePathToIr, ir, { pretty: false });
    context.logger.debug(`Wrote IR to ${absolutePathToIr}`);
    return absolutePathToIr;
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
