import type { FernWorkspace } from "@fern-api/api-workspace-commons";
import type { FernToken } from "@fern-api/auth";
import { schemas } from "@fern-api/config";
import type { Audiences } from "@fern-api/configuration";
import { fernConfigJson, generatorsYml, SNIPPET_JSON_FILENAME } from "@fern-api/configuration";
import { removeDefaultDockerOrgIfPresent } from "@fern-api/configuration-loader";
import type { ContainerRunner } from "@fern-api/core-utils";
import { extractErrorMessage } from "@fern-api/core-utils";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    ContainerExecutionEnvironment,
    GenerationRunner,
    runLocalGenerationForWorkspace
} from "@fern-api/local-workspace-runner";
import { LogLevel } from "@fern-api/logger";
import { TaskResult } from "@fern-api/task-context";
import { rm } from "fs/promises";
import type { AiConfig } from "../../ai/config/AiConfig.js";
import { LegacyFernWorkspaceAdapter } from "../../api/adapter/LegacyFernWorkspaceAdapter.js";
import type { ApiDefinition } from "../../api/config/ApiDefinition.js";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";
import { LegacyGeneratorInvocationAdapter } from "../adapter/LegacyGeneratorInvocationAdapter.js";
import type { Target } from "../config/Target.js";
import { resolveTargetOutput } from "./utils/resolveTargetOutput.js";
/**
 * Runs generation using the legacy local-generation infrastructure.
 */
export namespace LegacyLocalGenerationRunner {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;
    }

    export interface RunArgs {
        /** The current task */
        task: Task;

        /** The target to generate */
        target: Target;

        /** The API definition to generate from */
        apiDefinition: ApiDefinition;

        /** Organization name */
        organization: string;

        /** AI configuration */
        ai?: AiConfig;

        /** Audiences to filter by */
        audiences?: Audiences;

        /** Container engine to use for local generation */
        containerEngine?: ContainerRunner;

        /** Whether to keep Docker containers after generation */
        keepContainer?: boolean;

        /** Whether this is a preview/dry-run */
        preview?: boolean;

        /** Custom output path for preview mode */
        outputPath?: AbsoluteFilePath;

        /** Version override for the generated SDK */
        version?: string;

        /** Authentication token (required for self-hosted git generation) */
        token?: FernToken;

        /** Whether to ignore .fernignore and overwrite all files */
        skipFernignore?: boolean;

        /** Require all referenced environment variables to be defined */
        requireEnvVars?: boolean;
    }

    export interface Result {
        /** Whether generation succeeded */
        success: boolean;

        /** Paths and/or URLs to generated output (on success) */
        output?: string[];

        /** Error message (on failure) */
        error?: string;
    }
}

export class LegacyLocalGenerationRunner {
    private readonly context: Context;
    private readonly cliVersion: string;
    private readonly invocationAdapter: LegacyGeneratorInvocationAdapter;

    constructor(config: LegacyLocalGenerationRunner.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
        this.invocationAdapter = new LegacyGeneratorInvocationAdapter({ context: this.context });
    }

    public async run(args: LegacyLocalGenerationRunner.RunArgs): Promise<LegacyLocalGenerationRunner.Result> {
        const taskContext = new TaskContextAdapter({
            context: this.context,
            task: args.task,
            logLevel: LogLevel.Info
        });
        try {
            const generatorInvocation = await this.invocationAdapter.adapt(args.target);
            const generatorGroup: generatorsYml.GeneratorGroup = {
                groupName: args.target.name,
                audiences: args.audiences ?? { type: "all" },
                generators: [generatorInvocation],
                reviewers: undefined
            };
            const workspaceAdapter = new LegacyFernWorkspaceAdapter({
                context: this.context,
                cliVersion: this.cliVersion,
                task: args.task
            });
            const fernWorkspace = await workspaceAdapter.adapt(args.apiDefinition);

            if (args.target.output.git != null && schemas.isGitOutputSelfHosted(args.target.output.git)) {
                return await this.runSelfHostedGeneration({
                    args,
                    taskContext,
                    fernWorkspace,
                    generatorGroup
                });
            }

            return await this.runLocalGeneration({
                args,
                taskContext,
                fernWorkspace,
                generatorGroup,
                generatorInvocation
            });
        } catch (error) {
            if (taskContext.getResult() === TaskResult.Failure) {
                // If the task already recorded a failure, the error is in task.logs.
                return { success: false };
            }
            return {
                success: false,
                error: extractErrorMessage(error)
            };
        }
    }

    private async runSelfHostedGeneration({
        args,
        taskContext,
        fernWorkspace,
        generatorGroup
    }: {
        args: LegacyLocalGenerationRunner.RunArgs;
        taskContext: TaskContextAdapter;
        fernWorkspace: FernWorkspace;
        generatorGroup: generatorsYml.GeneratorGroup;
    }): Promise<LegacyLocalGenerationRunner.Result> {
        const projectConfig: fernConfigJson.ProjectConfig = {
            _absolutePath: join(this.context.cwd, RelativeFilePath.of("fern.config.json")),
            rawConfig: {
                organization: args.organization,
                version: this.cliVersion
            },
            organization: args.organization,
            version: this.cliVersion
        };

        await runLocalGenerationForWorkspace({
            token: args.token,
            projectConfig,
            workspace: fernWorkspace,
            generatorGroup,
            version: args.version,
            keepDocker: args.keepContainer ?? false,
            context: taskContext,
            runner: args.containerEngine,
            absolutePathToPreview: undefined,
            inspect: false,
            ai: undefined,
            skipFernignore: args.skipFernignore,
            requireEnvVars: args.requireEnvVars,
            disableTelemetry: !this.context.telemetry.isTelemetryEnabled()
        });

        if (taskContext.getResult() === TaskResult.Failure) {
            return {
                success: false
            };
        }

        return {
            success: true,
            output: resolveTargetOutput({
                context: this.context,
                task: args.task,
                target: args.target,
                preview: args.preview,
                outputPath: args.outputPath
            })
        };
    }

    private async runLocalGeneration({
        args,
        taskContext,
        fernWorkspace,
        generatorGroup,
        generatorInvocation
    }: {
        args: LegacyLocalGenerationRunner.RunArgs;
        taskContext: TaskContextAdapter;
        fernWorkspace: FernWorkspace;
        generatorGroup: generatorsYml.GeneratorGroup;
        generatorInvocation: generatorsYml.GeneratorInvocation;
    }): Promise<LegacyLocalGenerationRunner.Result> {
        const imageRef = args.target.registry
            ? `${args.target.registry}/${removeDefaultDockerOrgIfPresent(args.target.image)}`
            : args.target.image;
        const containerImage = `${imageRef}:${args.target.version}`;
        const executionEnvironment = new ContainerExecutionEnvironment({
            containerImage,
            keepContainer: args.keepContainer ?? false,
            runner: args.containerEngine,
            disableTelemetry: !this.context.telemetry.isTelemetryEnabled()
        });

        const runner = new GenerationRunner(executionEnvironment);
        await runner.run({
            organization: args.organization,
            workspace: fernWorkspace,
            generatorGroup,
            context: taskContext,
            outputVersionOverride: args.version,
            ai: args.ai,
            absolutePathToFernConfig: undefined,
            irVersionOverride: undefined,
            shouldGenerateDynamicSnippetTests: false,
            skipUnstableDynamicSnippetTests: true,
            inspect: false,
            skipFernignore: args.skipFernignore
        });

        if (args.target.output.path != null && generatorInvocation.absolutePathToLocalOutput != null) {
            // The local generator runner always writes snippet.json to the
            // output directory. Remove it so that the user receives a clean
            // full-project repository.
            //
            // TODO: Is this a bug in the local generator? Can we patch this
            // in the @fern-api/local-generation package?
            const snippetPath = join(
                generatorInvocation.absolutePathToLocalOutput,
                RelativeFilePath.of(SNIPPET_JSON_FILENAME)
            );
            await rm(snippetPath, { force: true });
        }

        if (taskContext.getResult() === TaskResult.Failure) {
            return {
                success: false
            };
        }

        return {
            success: true,
            output: this.context.resolveTargetOutputs(args.target)
        };
    }
}
