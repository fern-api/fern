import { Audiences, fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import {
    migrateIntermediateRepresentationForGenerator,
    migrateIntermediateRepresentationThroughVersion
} from "@fern-api/ir-migrations";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { cp, mkdir, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { LocalTaskHandler } from "./LocalTaskHandler";
import { runGenerator } from "./run-generator/runGenerator";

export async function runLocalGenerationForWorkspace({
    projectConfig,
    workspace,
    generatorGroup,
    keepDocker,
    context,
    writeUnitTests
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: FernWorkspace;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
    writeUnitTests: boolean;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    interactiveTaskContext.failWithoutThrowing(
                        "Cannot generate because output location is not local-file-system"
                    );
                } else {
                    await writeFilesToDiskAndRunGenerator({
                        organization: projectConfig.organization,
                        absolutePathToFernConfig: projectConfig._absolutePath,
                        workspace,
                        generatorInvocation,
                        absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
                        audiences: generatorGroup.audiences,
                        workspaceTempDir,
                        keepDocker,
                        context: interactiveTaskContext,
                        irVersionOverride: generatorInvocation.irVersionOverride,
                        outputVersionOverride: undefined,
                        writeIr: false,
                        writeSnippets: false,
                        writeUnitTests: false
                    });
                    interactiveTaskContext.logger.info(
                        chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                    );
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

export async function runLocalGenerationForSeed({
    organization,
    absolutePathToFernConfig,
    workspace,
    generatorGroup,
    keepDocker,
    context,
    irVersionOverride,
    outputVersionOverride
}: {
    organization: string;
    workspace: FernWorkspace;
    absolutePathToFernConfig: AbsoluteFilePath | undefined;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
    irVersionOverride: string | undefined;
    outputVersionOverride: string | undefined;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    interactiveTaskContext.failWithoutThrowing(
                        "Cannot generate because output location is not local-file-system"
                    );
                } else {
                    await writeFilesToDiskAndRunGenerator({
                        organization,
                        absolutePathToFernConfig,
                        workspace,
                        generatorInvocation,
                        absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
                        audiences: generatorGroup.audiences,
                        workspaceTempDir,
                        keepDocker,
                        context: interactiveTaskContext,
                        irVersionOverride,
                        outputVersionOverride,
                        writeIr: true,
                        writeSnippets: true,
                        writeUnitTests: true
                    });
                    interactiveTaskContext.logger.info(
                        chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                    );
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

async function getWorkspaceTempDir(): Promise<tmp.DirectoryResult> {
    return tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern"
    });
}

async function writeFilesToDiskAndRunGenerator({
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
    writeIr,
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
    writeIr: boolean;
    writeSnippets: boolean;
    writeUnitTests: boolean;
}): Promise<void> {
    let absolutePathToIr: AbsoluteFilePath | undefined;
    if (writeIr) {
        absolutePathToIr = await writeIrToFile({
            workspace,
            audiences,
            generatorInvocation,
            workspaceTempDir,
            context,
            irVersionOverride
        });
        context.logger.debug("Wrote IR to: " + absolutePathToIr);
    }

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

    const tmpDotMockDirectory = await tmp.dir({
        tmpdir: workspaceTempDir.path
    });
    const absolutePathToDotMockDirectory = AbsoluteFilePath.of(tmpDotMockDirectory.path);
    context.logger.debug("Will write .mock to: " + absolutePathToDotMockDirectory);

    const absolutePathToFernDefinition = workspace.definition.absoluteFilepath;

    let absolutePathToTmpSnippetJSON = undefined;
    if (writeSnippets) {
        const snippetJsonFile = await tmp.file({
            tmpdir: workspaceTempDir.path
        });
        absolutePathToTmpSnippetJSON = AbsoluteFilePath.of(snippetJsonFile.path);
        context.logger.debug("Will write snippet.json to: " + absolutePathToTmpSnippetJSON);
    }

    await writeDotMock(
        writeUnitTests,
        generatorInvocation,
        absolutePathToDotMockDirectory,
        absolutePathToFernDefinition,
        absolutePathToFernConfig
    );

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
        writeUnitTests
    });

    const taskHandler = new LocalTaskHandler({
        context,
        absolutePathToLocalOutput,
        absolutePathToTmpOutputDirectory,
        absolutePathToTmpSnippetJSON,
        absolutePathToDotMockDirectory,
        absolutePathToIr
    });
    await taskHandler.copyGeneratedFiles();
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
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: generatorInvocation.language,
        smartCasing: generatorInvocation.smartCasing,
        disableExamples: generatorInvocation.disableExamples
    });
    context.logger.debug("Generated IR");
    const migratedIntermediateRepresentation =
        irVersionOverride != null
            ? await migrateIntermediateRepresentationThroughVersion({
                  intermediateRepresentation,
                  context,
                  version: irVersionOverride
              })
            : await migrateIntermediateRepresentationForGenerator({
                  intermediateRepresentation,
                  context,
                  targetGenerator: {
                      name: generatorInvocation.name,
                      version: generatorInvocation.version
                  }
              });
    context.logger.debug("Migrated IR");
    const irFile = await tmp.file({
        tmpdir: workspaceTempDir.path
    });
    const absolutePathToIr = AbsoluteFilePath.of(irFile.path);
    await writeFile(absolutePathToIr, JSON.stringify(migratedIntermediateRepresentation, undefined, 4));
    context.logger.debug(`Wrote IR to ${absolutePathToIr}`);
    return absolutePathToIr;
}

// Copy Fern definition to output directory
async function writeDotMock(
    writeUnitTests: boolean,
    generatorInvocation: generatorsYml.GeneratorInvocation,
    absolutePathToDotMockDirectory: AbsoluteFilePath,
    absolutePathToFernDefinition: AbsoluteFilePath | undefined,
    absolutePathToFernConfig: AbsoluteFilePath | undefined
): Promise<void> {
    if (writeUnitTests && (generatorInvocation.outputMode.type ?? "").startsWith("github")) {
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
}
