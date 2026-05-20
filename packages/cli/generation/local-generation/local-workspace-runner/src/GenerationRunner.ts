import {
    detectCiProvider,
    detectInvocationSource,
    FernWorkspace,
    getOriginGitCommit,
    getOriginGitCommitIsDirty,
    type Spec
} from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generatorsYml, SNIPPET_JSON_FILENAME } from "@fern-api/configuration";
import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { type PipelineLogger, PostGenerationPipeline } from "@fern-api/generator-cli/pipeline";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { CliError, TaskAbortSignal, TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import chalk from "chalk";
import { assertVerifyPipelineSucceeded } from "./assertVerifyPipelineSucceeded.js";
import { generateDynamicSnippetTests } from "./dynamic-snippets/generateDynamicSnippetTests.js";
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
        /**
         * When true, run `PostGenerationPipeline` with `VerificationStep` after the
         * generator finishes writing files. Exercises the same validator-container
         * code path that `fern generate --local --verify` (and Fiddle) use today, so
         * seed CI catches regressions in the verify.sh + validator-image plumbing
         * end-to-end.
         *
         * Currently wired only for the TypeScript SDK generator, because it is the
         * only generator emitting `.fern/verify.sh` today (FER-9681 will extend
         * emission to the remaining language generators).
         */
        verify?: boolean;
        /**
         * Raw API spec files (OpenAPI, protobuf, etc.) to pre-process and mount
         * into the generator container. When provided, specs are bundled, overrides
         * merged, overlays applied, and the result is written as compact JSON.
         */
        rawApiSpecs?: Spec[];
        /**
         * Container runtime to use when `verify` is true. Defaults to "docker".
         * Ignored when `verify` is false.
         */
        verifyRunner?: ContainerRunner;
        /**
         * Optional override for the validator-image tag. `VerificationStep` derives
         * the image as `{generatorName}-validator:{version}` from
         * `generatorVersions[generatorName]`. Seed sets this to `"latest"` because
         * the generator runs at the `:local` tag locally but no `:local` validator
         * image is built today — the published `:latest` is the closest analog.
         * When undefined, the generator invocation's own version is used (the
         * behavior `runLocalGenerationForWorkspace` relies on).
         */
        verifyValidatorVersion?: string;
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
        skipAutogenerationIfManualExamplesExist,
        rawApiSpecs,
        verify,
        verifyRunner,
        verifyValidatorVersion
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
                            const { ir, generatorConfig } = await this.executeGenerator({
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
                                rawApiSpecs
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

                            if (verify === true) {
                                await runVerifyPipeline({
                                    outputDir: generatorInvocation.absolutePathToLocalOutput,
                                    generatorName: generatorInvocation.name,
                                    generatorVersion: verifyValidatorVersion ?? generatorInvocation.version,
                                    cliVersion: workspace.cliVersion,
                                    runner: verifyRunner ?? "docker",
                                    context: interactiveTaskContext
                                });
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
        rawApiSpecs
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
        rawApiSpecs?: Spec[];
    }): Promise<{
        ir: IntermediateRepresentation;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
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

        // Generate IR once here
        const rawIr = generateIntermediateRepresentation({
            workspace,
            audiences: generatorGroup.audiences,
            generationLanguage: generatorInvocation.language,
            keywords: generatorInvocation.keywords,
            smartCasing: generatorInvocation.smartCasing,
            exampleGeneration: {
                includeOptionalRequestPropertyExamples: true,
                disabled: generatorInvocation.disableExamples,
                skipAutogenerationIfManualExamplesExist: skipAutogenerationIfManualExamplesExist ?? false
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
                generatorConfig: generatorInvocation.config,
                originGitCommit: getOriginGitCommit(),
                originGitCommitIsDirty: getOriginGitCommitIsDirty(),
                invokedBy: detectInvocationSource(),
                requestedVersion: outputVersionOverride,
                ciProvider: detectCiProvider()
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
            ai: workspace.generatorsConfiguration?.ai,
            absolutePathToSpecRepo: undefined,
            skipFernignore,
            rawApiSpecs
        });
    }
}

/**
 * Mirrors the `verifyOnlyPipelineEnabled` branch of `runLocalGenerationForWorkspace`:
 * instantiates `PostGenerationPipeline` with only `VerificationStep` enabled so the
 * same validator-container + image-derivation + `execInContainer` flow used by
 * `fern generate --local --verify` is exercised end-to-end by the seed runner.
 *
 * `VerificationStep` no-ops when `.fern/verify.sh` is absent, so wiring a generator
 * that does not emit the script (today: anything other than the TypeScript SDK)
 * is a safe no-op rather than a hard failure.
 */
async function runVerifyPipeline({
    outputDir,
    generatorName,
    generatorVersion,
    cliVersion,
    runner,
    context
}: {
    outputDir: AbsoluteFilePath;
    generatorName: string;
    generatorVersion: string;
    cliVersion: string | undefined;
    runner: ContainerRunner;
    context: TaskContext;
}): Promise<void> {
    const pipelineLogger: PipelineLogger = {
        debug: (msg) => context.logger.debug(msg),
        info: (msg) => context.logger.info(msg),
        warn: (msg) => context.logger.warn(msg),
        error: (msg) => context.logger.error(msg)
    };

    const pipeline = new PostGenerationPipeline(
        {
            outputDir,
            verify: { enabled: true, runner },
            cliVersion: cliVersion ?? "unknown",
            generatorVersions: { [generatorName]: generatorVersion },
            generatorName
        },
        pipelineLogger
    );

    const pipelineResult = await pipeline.run();
    assertVerifyPipelineSucceeded(pipelineResult, generatorName);
}
