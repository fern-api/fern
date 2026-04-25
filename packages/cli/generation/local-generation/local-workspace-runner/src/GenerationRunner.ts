import {
    detectCiProvider,
    detectInvocationSource,
    FernWorkspace,
    getOriginGitCommit,
    getOriginGitCommitIsDirty
} from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generatorsYml, SNIPPET_JSON_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { CliError, TaskAbortSignal, TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import chalk from "chalk";
import { generateDynamicSnippetTests } from "./dynamic-snippets/generateDynamicSnippetTests.js";
import { generateDynamicSnippetsTestSuite } from "./dynamic-snippets/generateDynamicSnippetsTestSuite.js";
import { DynamicSnippetsJavaTestGenerator } from "./dynamic-snippets/java/DynamicSnippetsJavaTestGenerator.js";
import { ExecutionEnvironment } from "./ExecutionEnvironment.js";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator.js";
import { getWorkspaceTempDir } from "./runLocalGenerationForWorkspace.js";

export declare namespace GenerationRunner {
    interface RunArgs {
        organization: string;
        workspace: FernWorkspace;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        generatorGroup: generatorsYml.GeneratorGroup;
        context: TaskContext;
        irVersionOverride: string | undefined;
        outputVersionOverride: string | undefined;
        shouldGenerateDynamicSnippetTests: boolean | undefined;
        skipUnstableDynamicSnippetTests?: boolean;
        inspect: boolean;
        ai: generatorsYml.AiServicesSchema | undefined;
        skipFernignore?: boolean;
        skipAutogenerationIfManualExamplesExist?: boolean;
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
        inspect,
        skipFernignore,
        skipAutogenerationIfManualExamplesExist
    }: GenerationRunner.RunArgs): Promise<void> {
        const results = await Promise.all(
            generatorGroup.generators.map(async (generatorInvocation) => {
                return context.runInteractiveTask(
                    { name: generatorInvocation.name },
                    async (interactiveTaskContext) => {
                        if (generatorInvocation.absolutePathToLocalOutput == null) {
                            interactiveTaskContext.failWithoutThrowing(
                                "Cannot generate because output location is not local-file-system",
                                undefined,
                                { code: CliError.Code.ConfigError }
                            );
                            return;
                        }

                        try {
                            const { ir, generatorConfig, preGeneratedFiles } = await this.executeGenerator({
                                generatorGroup,
                                generatorInvocation,
                                context: interactiveTaskContext,
                                workspace,
                                organization,
                                irVersionOverride,
                                outputVersionOverride,
                                absolutePathToFernConfig,
                                inspect,
                                skipFernignore,
                                skipAutogenerationIfManualExamplesExist,
                                shouldGenerateDynamicSnippetTests,
                                skipUnstableDynamicSnippetTests
                            });

                            interactiveTaskContext.logger.info(
                                chalk.green("Wrote files to " + generatorInvocation.absolutePathToLocalOutput)
                            );

                            // EXP-042: Skip separate snippet generation if pre-generated during Docker execution
                            if (preGeneratedFiles != null && preGeneratedFiles.length > 0) {
                                interactiveTaskContext.logger.info(
                                    `Dynamic snippet tests were pre-generated (${preGeneratedFiles.length} files)`
                                );
                            } else if (shouldGenerateDynamicSnippetTests && generatorInvocation.language != null) {
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
                            if (error instanceof TaskAbortSignal) {
                                // already logged by failAndThrow, nothing to do
                            } else {
                                interactiveTaskContext.failWithoutThrowing(
                                    `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                                    error,
                                    { code: error instanceof CliError ? error.code : CliError.Code.InternalError }
                                );
                            }
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
        inspect,
        skipFernignore,
        skipAutogenerationIfManualExamplesExist,
        shouldGenerateDynamicSnippetTests,
        skipUnstableDynamicSnippetTests
    }: {
        generatorGroup: generatorsYml.GeneratorGroup;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        context: TaskContext;
        workspace: FernWorkspace;
        organization: string;
        irVersionOverride: string | undefined;
        outputVersionOverride: string | undefined;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        inspect: boolean;
        skipFernignore?: boolean;
        skipAutogenerationIfManualExamplesExist?: boolean;
        shouldGenerateDynamicSnippetTests?: boolean;
        skipUnstableDynamicSnippetTests?: boolean;
    }): Promise<{
        ir: IntermediateRepresentation;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        preGeneratedFiles?: Array<{ absolutePath: string; content: string }>;
        shouldCommit: boolean;
        autoVersioningCommitMessage?: string;
        autoVersioningChangelogEntry?: string;
        autoVersioningPrDescription?: string;
        autoVersioningVersionBumpReason?: string;
    }> {
        context.logger.info(`Starting generation for ${generatorInvocation.name}`);

        if (generatorInvocation.absolutePathToLocalOutput == null) {
            throw new CliError({ message: "Output path is required for generation", code: CliError.Code.ConfigError });
        }

        // EXP-022: Defer example generation to overlap with container execution.
        // Generate base IR without examples (~400ms instead of ~1550ms), then
        // run example generation (~1150ms) in parallel with container execution.
        const exampleGeneration = {
            includeOptionalRequestPropertyExamples: true,
            disabled: generatorInvocation.disableExamples ?? false,
            skipAutogenerationIfManualExamplesExist: skipAutogenerationIfManualExamplesExist ?? false
        };
        // Only defer examples for Java generators that support FULL_IR_PATH recovery.
        // Non-Java generators must receive the full IR with examples and dynamic field.
        const isJavaGenerator = generatorInvocation.language === "java";
        const shouldDeferExamples = isJavaGenerator && !exampleGeneration.disabled;

        const irStart = Date.now();
        const rawIr = generateIntermediateRepresentation({
            workspace,
            audiences: generatorGroup.audiences,
            generationLanguage: generatorInvocation.language,
            keywords: generatorInvocation.keywords,
            smartCasing: generatorInvocation.smartCasing,
            exampleGeneration: shouldDeferExamples ? { ...exampleGeneration, disabled: true } : exampleGeneration,
            readme: generatorInvocation.readme,
            version: outputVersionOverride,
            packageName: generatorsYml.getPackageName({ generatorInvocation }),
            context,
            sourceResolver: new SourceResolverImpl(context, workspace),
            generationMetadata: {
                cliVersion: workspace.cliVersion,
                generatorName: generatorInvocation.name,
                generatorVersion: generatorInvocation.version,
                generatorConfig: generatorInvocation.config,
                originGitCommit: getOriginGitCommit(),
                originGitCommitIsDirty: getOriginGitCommitIsDirty(),
                invokedBy: detectInvocationSource(),
                requestedVersion: outputVersionOverride,
                ciProvider: detectCiProvider()
            }
        });
        context.logger.info(`[perf] generateIR: ${Date.now() - irStart}ms`);

        const workspaceTempDir = await getWorkspaceTempDir();

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
            ai: workspace.generatorsConfiguration?.ai,
            absolutePathToSpecRepo: undefined,
            skipFernignore,
            deferredExampleGeneration: shouldDeferExamples
                ? {
                      exampleGeneration,
                      generationLanguage: generatorInvocation.language,
                      smartCasing: generatorInvocation.smartCasing
                  }
                : undefined,
            // EXP-042: Pre-generate Java snippet tests during Docker execution.
            // After deferred IR work completes (examples + dynamic ready), the snippet
            // generation runs concurrently with Docker container, saving ~755ms.
            onDeferredWorkComplete:
                shouldDeferExamples &&
                shouldGenerateDynamicSnippetTests &&
                generatorInvocation.language === "java" &&
                generatorInvocation.absolutePathToLocalOutput != null
                    ? async (ir, config) => {
                          const outputDir = generatorInvocation.absolutePathToLocalOutput;
                          if (outputDir == null) {
                              return [];
                          }
                          const testSuite = await generateDynamicSnippetsTestSuite({ ir, config });
                          const generator = new DynamicSnippetsJavaTestGenerator(
                              context,
                              testSuite.ir,
                              testSuite.config
                          );
                          return generator.generateSnippetsInMemory({
                              outputDir,
                              requests: testSuite.requests
                          });
                      }
                    : undefined
        });
    }
}
