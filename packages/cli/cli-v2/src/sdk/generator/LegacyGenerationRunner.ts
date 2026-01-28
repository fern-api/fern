import type { Audiences } from "@fern-api/configuration";
import { generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ContainerExecutionEnvironment, GenerationRunner } from "@fern-api/local-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import { LegacyFernWorkspaceAdapter } from "../../api/adapter/LegacyFernWorkspaceAdapter";
import type { ApiDefinition } from "../../api/config/ApiDefinition";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter";
import type { Context } from "../../context/Context";
import type { Task } from "../../ui/Task";
import { LegacyGeneratorInvocationAdapter } from "../adapter/LegacyGeneratorInvocationAdapter";
import type { Target } from "../config/Target";

/**
 * Runs generation using the legacy local-generation infrastructure.
 */
export namespace LegacyGenerationRunner {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;
    }

    export interface RunArgs {
        /** Task for log display */
        task: Task;

        /** The target to generate */
        target: Target;

        /** The API definition to generate from */
        apiDefinition: ApiDefinition;

        /** Organization name */
        organization: string;

        /** Audiences to filter by */
        audiences?: Audiences;

        /** Version override for the generated SDK */
        version?: string;

        /** Whether to keep Docker containers after generation */
        keepContainer?: boolean;

        /** Whether this is a preview/dry-run */
        preview?: boolean;

        /** Custom output path for preview mode */
        outputPath?: AbsoluteFilePath;
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

export class LegacyGenerationRunner {
    private readonly context: Context;
    private readonly cliVersion: string;
    private readonly invocationAdapter: LegacyGeneratorInvocationAdapter;

    constructor(config: LegacyGenerationRunner.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
        this.invocationAdapter = new LegacyGeneratorInvocationAdapter({ context: this.context });
    }

    public async run(args: LegacyGenerationRunner.RunArgs): Promise<LegacyGenerationRunner.Result> {
        const taskContext = new TaskContextAdapter({ context: this.context, task: args.task });
        try {
            const generatorInvocation = this.invocationAdapter.adapt(args.target);
            const generatorGroup: generatorsYml.GeneratorGroup = {
                groupName: args.target.name,
                audiences: args.audiences ?? { type: "all" },
                generators: [generatorInvocation],
                reviewers: undefined
            };

            const containerImage = `${args.target.image}:${args.target.version}`;
            const executionEnvironment = new ContainerExecutionEnvironment({
                containerImage,
                keepContainer: args.keepContainer ?? false
            });

            const workspaceAdapter = new LegacyFernWorkspaceAdapter({
                context: this.context,
                cliVersion: this.cliVersion,
                task: args.task
            });
            const fernWorkspace = await workspaceAdapter.adapt(args.apiDefinition);

            const runner = new GenerationRunner(executionEnvironment);
            await runner.run({
                organization: args.organization,
                workspace: fernWorkspace,
                generatorGroup,
                context: taskContext,
                outputVersionOverride: args.version,
                shouldGenerateDynamicSnippetTests: false,
                skipUnstableDynamicSnippetTests: true,
                irVersionOverride: undefined,
                absolutePathToFernConfig: undefined,
                inspect: false,
                ai: undefined
            });

            if (taskContext.getResult() === TaskResult.Failure) {
                return {
                    success: false
                };
            }

            return {
                success: true,
                output: this.context.resolveTargetOutputs(args.target)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
