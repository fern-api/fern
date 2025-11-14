import { Audiences, generatorsYml, SNIPPET_TEMPLATES_JSON_FILENAME } from "@fern-api/configuration";
import { ContainerRunner } from "@fern-api/core-utils/src/types";
import { AbsoluteFilePath, streamObjectToFile } from "@fern-api/fs-utils";
import { ApiDefinitionSource, IntermediateRepresentation, SourceConfig } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, IdentifiableSource } from "@fern-api/workspace-loader";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { GeneratorConfig } from "@fern-fern/generator-exec-sdk/serialization";
import { mkdir, writeFile } from "fs/promises";
import * as path from "path";
import { join } from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { ContainerExecutionEnvironment } from "./ContainerExecutionEnvironment";
import {
    CODEGEN_OUTPUT_DIRECTORY_NAME,
    CONTAINER_CODEGEN_OUTPUT_DIRECTORY,
    CONTAINER_GENERATOR_CONFIG_PATH,
    CONTAINER_PATH_TO_IR,
    CONTAINER_PATH_TO_SNIPPET,
    CONTAINER_PATH_TO_SNIPPET_TEMPLATES,
    CONTAINER_SOURCES_DIRECTORY,
    GENERATOR_CONFIG_FILENAME,
    IR_FILENAME
} from "./constants";
import { ExecutionEnvironment } from "./ExecutionEnvironment";
import { getGeneratorConfig, getLicensePathFromConfig } from "./getGeneratorConfig";
import { getIntermediateRepresentation } from "./getIntermediateRepresentation";
import { LocalTaskHandler } from "./LocalTaskHandler";

export interface GeneratorRunResponse {
    ir: IntermediateRepresentation;
    generatorConfig: FernGeneratorExec.GeneratorConfig;
    absolutePathToIr: AbsoluteFilePath;
    absolutePathToConfigJson: AbsoluteFilePath;
}

function extractLicenseFilePath(
    generatorInvocation: generatorsYml.GeneratorInvocation,
    absolutePathToFernConfig?: AbsoluteFilePath
): AbsoluteFilePath | undefined {
    const licenseConfig = getLicensePathFromConfig(generatorInvocation);

    if (licenseConfig?.type === "custom") {
        const licensePath = licenseConfig.value;
        const baseDir = absolutePathToFernConfig ? path.dirname(absolutePathToFernConfig) : process.cwd();
        const absoluteLicensePath = path.isAbsolute(licensePath) ? licensePath : path.resolve(baseDir, licensePath);
        return AbsoluteFilePath.of(absoluteLicensePath);
    }

    return undefined;
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
    runner,
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
    runner: ContainerRunner | undefined;
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
        new ContainerExecutionEnvironment({
            containerImage: `${generatorInvocation.name}:${generatorInvocation.version}`,
            keepContainer: keepDocker
        });

    const isContainer = environment instanceof ContainerExecutionEnvironment;
    const paths = isContainer
        ? ({
              outputDirectory: AbsoluteFilePath.of(CONTAINER_CODEGEN_OUTPUT_DIRECTORY),
              irPath: AbsoluteFilePath.of(CONTAINER_PATH_TO_IR),
              configPath: AbsoluteFilePath.of(CONTAINER_GENERATOR_CONFIG_PATH),
              snippetPath: AbsoluteFilePath.of(CONTAINER_PATH_TO_SNIPPET),
              snippetTemplatePath: AbsoluteFilePath.of(CONTAINER_PATH_TO_SNIPPET_TEMPLATES)
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
        absolutePathToFernConfig,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients,
        paths
    });

    await writeFile(
        absolutePathToWriteConfigJson,
        JSON.stringify(await GeneratorConfig.jsonOrThrow(config), undefined, 4)
    );

    // Extract LICENSE file path for Docker mounting
    const absolutePathToLicenseFile = extractLicenseFilePath(generatorInvocation, absolutePathToFernConfig);

    await environment.execute({
        generatorName: generatorInvocation.name,
        irPath: absolutePathToIr,
        configPath: absolutePathToWriteConfigJson,
        outputPath: absolutePathToTmpOutputDirectory,
        snippetPath: absolutePathToTmpSnippetJSON,
        snippetTemplatePath: absolutePathToTmpSnippetTemplatesJSON,
        licenseFilePath: absolutePathToLicenseFile,
        context,
        inspect,
        runner
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
    return `${CONTAINER_SOURCES_DIRECTORY}/${source.id}`;
}
