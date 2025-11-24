import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generatorsYml, SNIPPET_JSON_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import chalk from "chalk";
import { generateDynamicSnippetTests } from "./dynamic-snippets/generateDynamicSnippetTests";
import { ExecutionEnvironment } from "./ExecutionEnvironment";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator";
import { getWorkspaceTempDir } from "./runLocalGenerationForWorkspace";

export declare namespace GenerationRunner {
    interface RunArgs {
        organization: string;
        workspace: FernWorkspace;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        generatorGroup: generatorsYml.GeneratorGroup;
        context: TaskContext;
        irVersionOverride: string;
        outputVersionOverride: string | undefined;
        shouldGenerateDynamicSnippetTests: boolean | undefined;
        skipUnstableDynamicSnippetTests?: boolean;
        inspect: boolean;
        ai: generatorsYml.AiServicesSchema | undefined;
    }
}

/**
 * Runs code generation using different execution environments.
 */
export class GenerationRunner {
    constructor(private readonly executionEnvironment: ExecutionEnvironment) {}

    public async run({
        organization,
        absolutePathToFernConfig,
        workspace,
        generatorGroup,
        context,
        irVersionOverride,
        outputVersionOverride,
        shouldGenerateDynamicSnippetTests,
        skipUnstableDynamicSnippetTests,
        inspect
    }: GenerationRunner.RunArgs): Promise<void> {
        const results = await Promise.all(
            generatorGroup.generators.map(async (generatorInvocation) => {
                return context.runInteractiveTask(
                    { name: generatorInvocation.name },
                    async (interactiveTaskContext) => {
                        if (generatorInvocation.absolutePathToLocalOutput == null) {
                            interactiveTaskContext.failWithoutThrowing(
                                "Cannot generate because output location is not local-file-system"
                            );
                            return;
                        }

                        try {
                            const { ir, generatorConfig } = await this.executeGenerator({
                                generatorGroup,
                                generatorInvocation,
                                context: interactiveTaskContext,
                                workspace,
                                organization,
                                irVersionOverride,
                                outputVersionOverride,
                                absolutePathToFernConfig,
                                inspect
                            });

                            interactiveTaskContext.logger.info(
                                chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                            );

                            if (shouldGenerateDynamicSnippetTests && generatorInvocation.language != null) {
                                interactiveTaskContext.logger.info(
                                    `Generating dynamic snippet tests for ${generatorInvocation.language}...`
                                );
                                await generateDynamicSnippetTests({
                                    context: interactiveTaskContext,
                                    ir,
                                    config: generatorConfig,
                                    language: generatorInvocation.language,
                                    outputDir: generatorInvocation.absolutePathToLocalOutput,
                                    skipUnstable: skipUnstableDynamicSnippetTests
                                });
                            } else {
                                interactiveTaskContext.logger.info(
                                    `Skipping dynamic snippet tests; shouldGenerateDynamicSnippetTests: ${shouldGenerateDynamicSnippetTests}, language: ${generatorInvocation.language}`
                                );
                            }
                        } catch (error) {
                            interactiveTaskContext.failWithoutThrowing(
                                `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
                            );
                        }
                    }
                );
            })
        );
    }

    private async executeGenerator({
        generatorGroup,
        generatorInvocation,
        context,
        workspace,
        organization,
        irVersionOverride,
        outputVersionOverride,
        absolutePathToFernConfig,
        inspect
    }: {
        generatorGroup: generatorsYml.GeneratorGroup;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        context: TaskContext;
        workspace: FernWorkspace;
        organization: string;
        irVersionOverride: string;
        outputVersionOverride: string | undefined;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        inspect: boolean;
    }): Promise<{
        ir: IntermediateRepresentation;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        shouldCommit: boolean;
        autoVersioningCommitMessage?: string;
    }> {
        context.logger.info(`Starting generation for ${generatorInvocation.name}`);

        if (generatorInvocation.absolutePathToLocalOutput == null) {
            throw new Error("Output path is required for generation");
        }

        // Generate IR once here
        const rawIr = generateIntermediateRepresentation({
            workspace,
            audiences: generatorGroup.audiences,
            generationLanguage: generatorInvocation.language,
            keywords: generatorInvocation.keywords,
            smartCasing: generatorInvocation.smartCasing,
            exampleGeneration: {
                includeOptionalRequestPropertyExamples: true,
                disabled: generatorInvocation.disableExamples
            },
            readme: generatorInvocation.readme,
            version: outputVersionOverride,
            packageName: generatorsYml.getPackageName({ generatorInvocation }),
            context,
            sourceResolver: new SourceResolverImpl(context, workspace),
            generationMetadata: {
                cliVersion: workspace.cliVersion,
                generatorName: generatorInvocation.name,
                generatorVersion: generatorInvocation.version,
                generatorConfig: generatorInvocation.config
            }
        });

        const workspaceTempDir = await getWorkspaceTempDir();

        // Pass the generated IR to writeFilesToDiskAndRunGenerator
        return writeFilesToDiskAndRunGenerator({
            organization,
            absolutePathToFernConfig,
            workspace,
            generatorInvocation,
            absolutePathToLocalOutput: generatorInvocation.absolutePathToLocalOutput,
            absolutePathToLocalSnippetJSON: generatorInvocation.absolutePathToLocalOutput
                ? AbsoluteFilePath.of(
                      join(generatorInvocation.absolutePathToLocalOutput, RelativeFilePath.of(SNIPPET_JSON_FILENAME))
                  )
                : undefined,
            absolutePathToLocalSnippetTemplateJSON: undefined,
            audiences: generatorGroup.audiences,
            workspaceTempDir,
            version: outputVersionOverride,
            keepDocker: false,
            context,
            irVersionOverride,
            outputVersionOverride,
            writeUnitTests: true,
            generateOauthClients: true,
            generatePaginatedClients: true,
            includeOptionalRequestPropertyExamples: true,
            inspect,
            executionEnvironment: this.executionEnvironment,
            ir: rawIr,
            runner: undefined,
            ai: workspace.generatorsConfiguration?.ai
        });
    }
}
