import { APIS_DIRECTORY, FERN_DIRECTORY, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import path from "path";
import { FixtureConfigurations, OutputMode } from "../../../config/api";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { Semaphore } from "../../../Semaphore";
import { Stopwatch } from "../../../Stopwatch";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../../utils/convertSeedWorkspaceToFernWorkspace";
import { ScriptRunner } from "../ScriptRunner";
import { TaskContextFactory } from "../TaskContextFactory";

export declare namespace TestRunner {
    interface Args {
        generator: GeneratorWorkspace;
        lock: Semaphore;
        taskContextFactory: TaskContextFactory;
        skipScripts: boolean;
        scriptRunner: ScriptRunner;
        keepDocker: boolean;
    }

    interface RunArgs {
        /** The fixture to run the generator on **/
        fixture: string;
        /** Configuration specific to the fixture **/
        configuration: FixtureConfigurations | undefined;
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
        outputMode: OutputMode;
        outputFolder: string;
        keepDocker: boolean | undefined;
        publishMetadata: unknown;
    }

    type TestResult = TestSuccess | TestFailure;

    interface TestSuccess {
        type: "success";
        id: string;
        metrics: TestCaseMetrics;
    }

    interface TestFailure {
        type: "failure";
        cause: "invalid-fixture" | "generation" | "compile";
        message?: string;
        id: string;
        metrics: TestCaseMetrics;
    }

    interface TestCaseMetrics {
        /** The time it takes to generate code via the generator */
        generationTime?: string;
        /** The time it takes to verify/compile the code */
        compileTime?: string;
    }
}

export abstract class TestRunner {
    protected readonly generator: GeneratorWorkspace;
    protected readonly lock: Semaphore;
    protected readonly taskContextFactory: TaskContextFactory;
    private readonly skipScripts: boolean;
    private readonly keepDocker: boolean;
    private scriptRunner: ScriptRunner;

    constructor({ generator, lock, taskContextFactory, skipScripts, keepDocker, scriptRunner }: TestRunner.Args) {
        this.generator = generator;
        this.lock = lock;
        this.taskContextFactory = taskContextFactory;
        this.skipScripts = skipScripts;
        this.keepDocker = keepDocker;
        this.scriptRunner = scriptRunner;
    }

    /**
     * Builds the generator.
     */
    public abstract build(): Promise<void>;

    /**
     * Runs the generator.
     */
    public async run({ fixture, configuration }: TestRunner.RunArgs): Promise<TestRunner.TestResult> {
        const metrics: TestRunner.TestCaseMetrics = {};

        const fixtureConfig = this.generator.workspaceConfig.fixtures?.[fixture];
        if (fixtureConfig == null) {
            return {
                type: "failure",
                cause: "invalid-fixture",
                message: `Fixture ${fixture} not found.`,
                id: fixture,
                metrics
            };
        }

        const absolutePathToWorkspace = AbsoluteFilePath.of(
            path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY, fixture)
        );
        const taskContext = this.taskContextFactory.create(`${this.generator.workspaceName}:${fixture}`);
        const outputFolder = configuration?.outputFolder ?? fixture;
        const fernWorkspace = await convertGeneratorWorkspaceToFernWorkspace({
            absolutePathToWorkspace,
            taskContext,
            fixture
        });
        if (fernWorkspace == null) {
            return {
                type: "failure",
                cause: "invalid-fixture",
                message: `Failed to validate fixture ${fixture}`,
                id: fixture,
                metrics
            };
        }

        taskContext.logger.debug("Acquiring lock...");
        await this.lock.acquire();
        taskContext.logger.info("Running generator...");
        try {
            const generationStopwatch = new Stopwatch();
            generationStopwatch.start();
            await this.runGenerator({
                id: configuration != null ? `${fixture}:${configuration.outputFolder}` : `${fixture}`,
                fernWorkspace,
                absolutePathToWorkspace,
                irVersion: this.generator.workspaceConfig.irVersion,
                outputVersion: configuration?.outputVersion,
                language: this.generator.workspaceConfig.language,
                selectAudiences: configuration?.audiences,
                fixture,
                customConfig: configuration?.customConfig,
                publishConfig: configuration?.publishConfig ?? undefined,
                taskContext,
                outputDir:
                    configuration == null
                        ? join(this.generator.absolutePathToWorkspace, RelativeFilePath.of(fixture))
                        : join(
                              this.generator.absolutePathToWorkspace,
                              RelativeFilePath.of(fixture),
                              RelativeFilePath.of(configuration.outputFolder)
                          ),
                outputMode: configuration?.outputMode ?? this.generator.workspaceConfig.defaultOutputMode,
                outputFolder,
                keepDocker: this.keepDocker,
                publishMetadata: configuration?.publishMetadata ?? undefined
            });
            generationStopwatch.stop();
            metrics.generationTime = generationStopwatch.duration();
        } catch (error) {
            return {
                type: "failure",
                cause: "generation",
                id: fixture,
                metrics
            };
        }

        if (this.skipScripts) {
            return {
                type: "success",
                id: fixture,
                metrics
            };
        }

        const scriptStopwatch = new Stopwatch();
        scriptStopwatch.start();

        const scriptResponse = await this.scriptRunner.run({ taskContext, fixture, outputFolder });

        scriptStopwatch.stop();
        metrics.compileTime = scriptStopwatch.duration();

        if (scriptResponse.type === "failure") {
            return {
                type: "failure",
                cause: "compile",
                id: fixture,
                metrics
            };
        }
        return {
            type: "success",
            id: fixture,
            metrics
        };
    }

    /**
     *
     */
    public abstract runGenerator({}: TestRunner.DoRunArgs): Promise<void>;
}
