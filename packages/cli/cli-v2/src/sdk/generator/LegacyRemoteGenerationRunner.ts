import type { FernToken } from "@fern-api/auth";
import type { Audiences } from "@fern-api/configuration";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import type { AiConfig } from "../../ai/config/AiConfig";
import { LegacyFernWorkspaceAdapter } from "../../api/adapter/LegacyFernWorkspaceAdapter";
import type { ApiDefinition } from "../../api/config/ApiDefinition";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter";
import type { Context } from "../../context/Context";
import type { Task } from "../../ui/Task";
import { LegacyGeneratorInvocationAdapter } from "../adapter/LegacyGeneratorInvocationAdapter";
import type { Target } from "../config/Target";

/**
 * Runs remote generation using the legacy remote-generation infrastructure.
 */
export namespace LegacyRemoteGenerationRunner {
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

        /** Fern authentication token */
        token: FernToken;

        /** AI services configuration (not used for remote generation) */
        ai?: AiConfig;

        /** Audiences to filter by */
        audiences?: Audiences;

        /** Whether to log S3 URLs */
        shouldLogS3Url?: boolean;

        /** Whether this is a preview/dry-run */
        preview?: boolean;

        /** Custom output path for preview mode */
        outputPath?: AbsoluteFilePath;

        /** Path to .fernignore file */
        fernignorePath?: string;

        /** Version override for the generated SDK */
        version?: string;
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

export class LegacyRemoteGenerationRunner {
    private readonly context: Context;
    private readonly cliVersion: string;
    private readonly invocationAdapter: LegacyGeneratorInvocationAdapter;

    constructor(config: LegacyRemoteGenerationRunner.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
        this.invocationAdapter = new LegacyGeneratorInvocationAdapter({ context: this.context });
    }

    public async run(args: LegacyRemoteGenerationRunner.RunArgs): Promise<LegacyRemoteGenerationRunner.Result> {
        const taskContext = new TaskContextAdapter({ task: args.task, context: this.context });
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

            const absolutePathToPreview = this.getAbsolutePathToPreview(args);
            await runRemoteGenerationForAPIWorkspace({
                projectConfig: this.getProjectConfig(args),
                organization: args.organization,
                workspace: fernWorkspace,
                context: taskContext,
                generatorGroup,
                version: args.version,
                shouldLogS3Url: args.shouldLogS3Url ?? false,
                token: args.token,
                mode: this.mapMode(args.target),
                fernignorePath: args.fernignorePath,
                absolutePathToPreview,
                whitelabel: undefined,
                dynamicIrOnly: false
            });

            if (taskContext.getResult() === TaskResult.Failure) {
                return {
                    success: false
                };
            }

            return {
                success: true,
                output:
                    absolutePathToPreview != null
                        ? [absolutePathToPreview.toString()]
                        : this.context.resolveTargetOutputs(args.target)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private getAbsolutePathToPreview(args: LegacyRemoteGenerationRunner.RunArgs): AbsoluteFilePath | undefined {
        if (!args.preview) {
            return undefined;
        }
        if (args.outputPath != null) {
            return resolve(this.context.cwd, args.outputPath);
        }
        return join(this.context.cwd, RelativeFilePath.of(`.fern/preview`));
    }

    private getProjectConfig(args: LegacyRemoteGenerationRunner.RunArgs): fernConfigJson.ProjectConfig {
        return {
            _absolutePath: join(this.context.cwd, RelativeFilePath.of("fern.config.json")),
            rawConfig: {
                organization: args.organization,
                version: this.cliVersion
            },
            organization: args.organization,
            version: this.cliVersion
        };
    }

    private mapMode(target: Target): "pull-request" | undefined {
        if (target.output.git != null) {
            const git = target.output.git;
            switch (git.mode) {
                case "pr":
                    return "pull-request";
                default:
                    return undefined;
            }
        }
        return undefined;
    }
}
