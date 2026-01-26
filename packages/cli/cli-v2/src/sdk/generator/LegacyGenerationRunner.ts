import type { Audiences } from "@fern-api/configuration";
import { generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ContainerExecutionEnvironment, GenerationRunner } from "@fern-api/local-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import { LegacyFernWorkspaceAdapter } from "../../api/adapter/LegacyFernWorkspaceAdapter";
import type { ApiDefinition } from "../../api/config/ApiDefinition";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter";
import type { Context } from "../../context/Context";
import { LegacyGeneratorInvocationAdapter } from "../adapter/LegacyGeneratorInvocationAdapter";
import type { Target } from "../config/Target";

/**
 * Runs generation using the v1 local-generation infrastructure.
 *
 * This class bridges v2 types (Target, ApiDefinition) to the v1 infrastructure,
 * reusing all the battle-tested logic for:
 *  - IR generation and migration
 *  - Docker container execution
 *  - Zip extraction
 *  - .fernignore handling
 *  - Auto-versioning
 *  - Snippet generation
 */
export namespace LegacyGenerationRunner {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;
    }

    export interface RunArgs {
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
    }

    export interface Result {
        /** Whether generation succeeded */
        success: boolean;

        /** Path to generated output (on success) */
        outputPath?: AbsoluteFilePath;

        /** Error message (on failure) */
        error?: string;
    }
}

export class LegacyGenerationRunner {
    private readonly context: Context;
    private readonly invocationAdapter: LegacyGeneratorInvocationAdapter;
    private readonly workspaceAdapter: LegacyFernWorkspaceAdapter;

    constructor(config: LegacyGenerationRunner.Config) {
        this.context = config.context;
        this.invocationAdapter = new LegacyGeneratorInvocationAdapter({ context: this.context });
        this.workspaceAdapter = new LegacyFernWorkspaceAdapter({
            context: this.context,
            cliVersion: config.cliVersion
        });
    }

    public async run(args: LegacyGenerationRunner.RunArgs): Promise<LegacyGenerationRunner.Result> {
        const taskContext = new TaskContextAdapter({ context: this.context, badge: args.target.name });
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

            const fernWorkspace = await this.workspaceAdapter.adapt(args.apiDefinition);

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

            // Check if the v1 infrastructure reported a failure via failWithoutThrowing
            if (taskContext.getResult() === TaskResult.Failure) {
                return {
                    success: false,
                    error: taskContext.getErrorMessage() ?? "Generation failed"
                };
            }

            return {
                success: true,
                outputPath: this.context.resolveOutputPath(args.target.output.path)
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: message
            };
        }
    }
}
