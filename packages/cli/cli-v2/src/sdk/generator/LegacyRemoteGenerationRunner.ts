import type { FernToken } from "@fern-api/auth";
import type { Audiences } from "@fern-api/configuration";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import type { AiConfig } from "../../ai/config/AiConfig.js";
import { LegacyFernWorkspaceAdapter } from "../../api/adapter/LegacyFernWorkspaceAdapter.js";
import type { ApiDefinition } from "../../api/config/ApiDefinition.js";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";
import { LegacyGeneratorInvocationAdapter } from "../adapter/LegacyGeneratorInvocationAdapter.js";
import type { Target } from "../config/Target.js";

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
        /** The current task */
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

interface GitOutput {
    pullRequestUrl?: string;
    commitHash?: string;
    branchUrl?: string;
    releaseUrl?: string;
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
        const taskContext = new TaskContextAdapter({
            context: this.context,
            task: args.task,
            logLevel: LogLevel.Info // Capture INFO logs to parse git output URLs
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

            const gitOutput = this.extractGitOutputFromTaskLogs(args.task);
            return {
                success: true,
                output: this.resolveOutput(args, gitOutput)
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

    /**
     * Extract git output URLs from task logs.
     *
     * The remote generation service logs messages like:
     *  - "Created pull request: https://github.com/owner/repo/pull/123"
     *  - "Created commit abc123"
     *  - "Pushed branch: https://github.com/owner/repo/tree/branch-name"
     *  - "Release tagged. View here: https://github.com/owner/repo/releases/tag/v1.0.0"
     */
    private extractGitOutputFromTaskLogs(task: Task): GitOutput | undefined {
        const gitOutput: GitOutput = {};
        for (const log of task.logs ?? []) {
            const prMatch = log.message.match(/Created pull request: (.+)/);
            if (prMatch != null) {
                gitOutput.pullRequestUrl = prMatch[1];
            }

            const commitMatch = log.message.match(/Created commit (\w+)/);
            if (commitMatch != null) {
                gitOutput.commitHash = commitMatch[1];
            }

            const branchMatch = log.message.match(/Pushed branch: (.+)/);
            if (branchMatch != null) {
                gitOutput.branchUrl = branchMatch[1];
            }

            const releaseMatch = log.message.match(/Release tagged\. View here: (.+)/);
            if (releaseMatch != null) {
                gitOutput.releaseUrl = releaseMatch[1];
            }
        }
        return Object.keys(gitOutput).length > 0 ? gitOutput : undefined;
    }

    /**
     * Resolve output URLs/paths for display.
     */
    private resolveOutput(
        args: LegacyRemoteGenerationRunner.RunArgs,
        gitOutput: GitOutput | undefined
    ): string[] | undefined {
        const absolutePathToPreview = this.getAbsolutePathToPreview(args);
        if (absolutePathToPreview != null) {
            return [absolutePathToPreview.toString()];
        }
        if (gitOutput != null) {
            if (gitOutput.pullRequestUrl != null) {
                return [gitOutput.pullRequestUrl];
            }
            if (gitOutput.releaseUrl != null) {
                return [gitOutput.releaseUrl];
            }
            if (gitOutput.branchUrl != null) {
                return [gitOutput.branchUrl];
            }
        }
        // Fall back to target config (repo URL or local path).
        return this.context.resolveTargetOutputs(args.target);
    }
}
