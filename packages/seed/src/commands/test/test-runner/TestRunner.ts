import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { APIS_DIRECTORY, FERN_DIRECTORY, GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import { getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation } from "@fern-api/workspace-loader";
import path from "path";
import { FixtureConfigurations, OutputMode } from "../../../config/api/index.js";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces.js";
import { Semaphore } from "../../../Semaphore.js";
import { Stopwatch } from "../../../Stopwatch.js";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../../utils/convertSeedWorkspaceToFernWorkspace.js";
import { ParsedDockerName, parseDockerOrThrow } from "../../../utils/parseDockerOrThrow.js";
import { workspaceShouldGenerateDynamicSnippetTests } from "../../../workspaceShouldGenerateDynamicSnippetTests.js";
import { ScriptRunner } from "../index.js";
import { TaskContextFactory } from "../TaskContextFactory.js";
import { WorkspaceCache } from "../WorkspaceCache.js";

export declare namespace TestRunner {
    interface Args {
        generator: GeneratorWorkspace;
        lock: Semaphore;
        taskContextFactory: TaskContextFactory;
        skipScripts: boolean;
        scriptRunner: ScriptRunner | undefined;
        keepContainer: boolean;
        inspect: boolean;
        workspaceCache?: WorkspaceCache;
    }

    interface RunArgs {
        /** The fixture to run the generator on **/
        fixture: string;
        /** Configuration specific to the fixture **/
        configuration: FixtureConfigurations | undefined;
        inspect: boolean;
        absolutePathToApiDefinition?: AbsoluteFilePath;
        outputDir?: AbsoluteFilePath;
        /** Generator invocation with per-generator API overrides **/
        generatorInvocation?: GeneratorInvocation;
    }

    interface DoRunArgs {
        id: string;
        fernWorkspace: FernWorkspace;
        fixture: string;
        irVersion: string;
        outputVersion: string | undefined;
        language: generatorsYml.GenerationLanguage | undefined;
        customConfig: unknown;
        publishConfig: unknown;
        selectAudiences?: string[];
        taskContext: TaskContext;
        outputDir: AbsoluteFilePath;
        absolutePathToWorkspace: AbsoluteFilePath;
        absolutePathToFernDefinition: AbsoluteFilePath;
        outputMode: OutputMode;
        outputFolder: string;
        keepContainer: boolean | undefined;
        publishMetadata: unknown;
        readme: generatorsYml.ReadmeSchema | undefined;
        shouldGenerateDynamicSnippetTests: boolean | undefined;
        inspect: boolean | undefined;
        license?: unknown;
        smartCasing?: boolean;
    }

    type TestResult = TestSuccess | TestFailure;

    interface TestSuccess {
        type: "success";
        id: string;
        outputFolder: string;
        metrics: TestCaseMetrics;
    }

    interface TestFailure {
        type: "failure";
        cause: "invalid-fixture" | "generation" | "build" | "test";
        message?: string;
        id: string;
        outputFolder: string;
        metrics: TestCaseMetrics;
    }

    interface TestCaseMetrics {
        /** The time it takes to generate code via the generator */
        generationTime?: string;
        /** The time it takes to build/compile the code */
        buildTime?: string;
        /** The time it takes to run tests */
        testTime?: string;
    }
}

const extractLicenseInfo = (license: unknown, absolutePathToApiDefinition: AbsoluteFilePath) => {
    if (license != null && typeof license === "object" && "custom" in license) {
        const licenseObj = license as { custom: string };
        const licensePath = licenseObj.custom;

        // Make the license path absolute
        return {
            custom: path.isAbsolute(licensePath)
                ? licensePath
                : path.join(absolutePathToApiDefinition.toString(), licensePath)
        };
    }
    return undefined;
};

export abstract class TestRunner {
    private buildInvocation: Promise<void> | undefined;
    protected readonly generator: GeneratorWorkspace;
    protected readonly lock: Semaphore;
    protected readonly taskContextFactory: TaskContextFactory;
    private readonly skipScripts: boolean;
    private readonly keepContainer: boolean;
    private scriptRunner: ScriptRunner | undefined;
    private readonly workspaceCache: WorkspaceCache | undefined;

    constructor({
        generator,
        lock,
        taskContextFactory,
        skipScripts,
        keepContainer,
        scriptRunner,
        workspaceCache
    }: TestRunner.Args) {
        this.generator = generator;
        this.lock = lock;
        this.taskContextFactory = taskContextFactory;
        this.skipScripts = skipScripts;
        this.keepContainer = keepContainer;
        this.scriptRunner = scriptRunner;
        this.workspaceCache = workspaceCache;
    }

    public abstract build(): Promise<void>;

    /**
     * Cleans up any resources (e.g., long-lived containers) used by this runner.
     * Override in subclasses that manage resources requiring explicit cleanup.
     */
    public async cleanup(): Promise<void> {
        // Default no-op; subclasses like ContainerTestRunner override this.
    }

    public async run({
        fixture,
        configuration,
        inspect,
        absolutePathToApiDefinition,
        outputDir,
        generatorInvocation
    }: TestRunner.RunArgs): Promise<TestRunner.TestResult> {
        let lockAcquired = false;
        try {
            if (this.buildInvocation == null) {
                this.buildInvocation = this.build();
            }
            await this.buildInvocation;

            const metrics: TestRunner.TestCaseMetrics = {};

            const id = configuration != null ? `${fixture}:${configuration.outputFolder}` : `${fixture}`;
            if (!absolutePathToApiDefinition) {
                absolutePathToApiDefinition = AbsoluteFilePath.of(
                    path.join(__dirname, "../../../test-definitions", FERN_DIRECTORY, APIS_DIRECTORY, fixture)
                );
            }
            const taskContext = this.taskContextFactory.create(`${this.generator.workspaceName}:${id}`);
            const disableDynamicSnippetTests = configuration?.disableDynamicSnippetTests ?? false;
            const outputFolder = configuration?.outputFolder ?? "";
            if (!outputDir) {
                outputDir =
                    configuration == null
                        ? join(this.generator.absolutePathToWorkspace, RelativeFilePath.of(fixture))
                        : join(
                              this.generator.absolutePathToWorkspace,
                              RelativeFilePath.of(fixture),
                              RelativeFilePath.of(configuration.outputFolder)
                          );
            }
            const language = this.generator.workspaceConfig.language;
            const outputVersion = configuration?.outputVersion ?? "0.0.1";
            const customConfig =
                this.generator.workspaceConfig.defaultCustomConfig != null || configuration?.customConfig != null
                    ? {
                          ...this.generator.workspaceConfig.defaultCustomConfig,
                          ...(configuration?.customConfig as Record<string, unknown>)
                      }
                    : undefined;
            const publishConfig = configuration?.publishConfig;
            const outputMode = configuration?.outputMode ?? this.generator.workspaceConfig.defaultOutputMode;
            const irVersion = this.generator.workspaceConfig.irVersion;
            const publishMetadata = configuration?.publishMetadata ?? undefined;
            const readme = configuration?.readmeConfig ?? undefined;
            const license = extractLicenseInfo(configuration?.license, absolutePathToApiDefinition);
            const smartCasing = generatorInvocation?.smartCasing;

            let fernWorkspace: FernWorkspace | undefined;
            if (this.workspaceCache != null && generatorInvocation == null) {
                // Use cache when no generatorInvocation overrides are present.
                // The cache is keyed by absolutePathToAPIDefinition (derived from fixture name),
                // which is safe because all variants of the same fixture share the same API definition.
                fernWorkspace = await this.workspaceCache.getOrConvertToFernWorkspace({
                    fixture,
                    absolutePathToAPIDefinition: absolutePathToApiDefinition,
                    taskContext
                });
            } else {
                // Fallback to uncached loading when generatorInvocation may provide
                // custom workspaceSettings or apiOverride specs.
                const apiWorkspace = await convertGeneratorWorkspaceToFernWorkspace({
                    absolutePathToAPIDefinition: absolutePathToApiDefinition,
                    taskContext,
                    fixture
                });
                const workspaceSettings =
                    generatorInvocation != null
                        ? getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                        : undefined;
                fernWorkspace = await apiWorkspace?.toFernWorkspace(
                    { context: taskContext },
                    workspaceSettings,
                    generatorInvocation?.apiOverride?.specs
                );
            }
            if (fernWorkspace == null) {
                return {
                    type: "failure",
                    cause: "invalid-fixture",
                    message: `Failed to validate fixture ${fixture}`,
                    id: fixture,
                    outputFolder,
                    metrics
                };
            }

            taskContext.logger.debug("Acquiring lock...");
            await this.lock.acquire();
            lockAcquired = true;
            taskContext.logger.info("Running generator...");
            try {
                const generationStopwatch = new Stopwatch();
                generationStopwatch.start();

                await this.runGenerator({
                    id,
                    fernWorkspace,
                    fixture,
                    irVersion,
                    outputVersion,
                    language,
                    customConfig,
                    publishConfig,
                    selectAudiences: configuration?.audiences,
                    taskContext,
                    outputDir,
                    absolutePathToWorkspace: this.generator.absolutePathToWorkspace,
                    absolutePathToFernDefinition: absolutePathToApiDefinition,
                    outputMode,
                    outputFolder,
                    keepContainer: this.keepContainer,
                    publishMetadata,
                    readme,
                    shouldGenerateDynamicSnippetTests:
                        !disableDynamicSnippetTests && workspaceShouldGenerateDynamicSnippetTests(this.generator),
                    inspect,
                    license,
                    smartCasing
                });

                generationStopwatch.stop();
                metrics.generationTime = generationStopwatch.duration();

                if (taskContext.getResult() === TaskResult.Failure) {
                    taskContext.logger.error("Generation failed");
                    return {
                        type: "failure",
                        cause: "generation",
                        id: fixture,
                        outputFolder,
                        metrics
                    };
                }
            } catch (error) {
                taskContext.logger.error(`Generation failed: ${(error as Error)?.message ?? "Unknown error"}`);
                taskContext.logger.error(`${(error as Error)?.stack}`);
                return {
                    type: "failure",
                    cause: "generation",
                    id: fixture,
                    outputFolder,
                    metrics
                };
            }

            // Release the semaphore after generation completes but before scripts run.
            // Scripts use their own separate containers (ContainerScriptRunner),
            // so holding the generation lock during scripts unnecessarily limits parallelism.
            this.lock.release();
            lockAcquired = false;

            if (this.skipScripts) {
                return {
                    type: "success",
                    id: fixture,
                    outputFolder,
                    metrics
                };
            }

            const scriptResponse = await this.scriptRunner?.run({
                taskContext,
                outputDir,
                id,
                skipScripts: configuration?.skipScripts
            });

            if (scriptResponse != null) {
                metrics.buildTime = this.formatDuration(scriptResponse.buildTimeMs);
                metrics.testTime = this.formatDuration(scriptResponse.testTimeMs);
            }

            if (scriptResponse?.type === "failure") {
                return {
                    type: "failure",
                    cause: scriptResponse.phase,
                    id: fixture,
                    outputFolder,
                    metrics
                };
            }
            return {
                type: "success",
                id: fixture,
                outputFolder,
                metrics
            };
        } finally {
            if (lockAcquired) {
                this.lock.release();
            }
        }
    }

    protected abstract runGenerator(args: TestRunner.DoRunArgs): Promise<void>;

    protected getParsedDockerImageName(): ParsedDockerName {
        return parseDockerOrThrow(this.generator.workspaceConfig.test.docker.image);
    }
    protected getDockerImageName(): string {
        return this.generator.workspaceConfig.test.docker.image;
    }

    private formatDuration(ms: number | undefined): string | undefined {
        if (ms == null) {
            return undefined;
        }
        const seconds = ms / 1000;
        if (seconds < 60) {
            return `${seconds.toFixed(2)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(2)}s`;
    }
}
