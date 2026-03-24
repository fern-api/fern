import type { FernToken } from "@fern-api/auth";
import type { Audiences } from "@fern-api/configuration";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath, basename, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import { cp, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
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

        /** Ignore the .fernignore file and upload an empty one */
        skipFernignore?: boolean;

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

            const absolutePathToPreview = await this.getAbsolutePathToPreview(args);
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
                skipFernignore: args.skipFernignore,
                absolutePathToPreview,
                whitelabel: undefined,
                dynamicIrOnly: false,
                retryRateLimited: false,
                requireEnvVars: true
            });

            if (this.isLocalGitCombo(args) && absolutePathToPreview != null) {
                // Copy preview output to the configured output.path, then clean up the
                // temp directory.
                const generatorName = basename(generatorInvocation.name);
                const previewOutputDirectory = join(absolutePathToPreview, RelativeFilePath.of(generatorName));
                const targetOutputDirectory = generatorInvocation.absolutePathToLocalOutput;
                if (targetOutputDirectory != null) {
                    await cp(previewOutputDirectory, targetOutputDirectory, { recursive: true });

                    // The preview output includes .git from the repository setup —- remove it
                    // so the output is represented as plain files, not a separate repository.
                    await rm(join(targetOutputDirectory, RelativeFilePath.of(".git")), {
                        recursive: true,
                        force: true
                    });
                }
                await rm(absolutePathToPreview, { recursive: true, force: true });
            }

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

    private async getAbsolutePathToPreview(
        args: LegacyRemoteGenerationRunner.RunArgs
    ): Promise<AbsoluteFilePath | undefined> {
        if (this.isLocalGitCombo(args)) {
            const tmpPreviewDirectory = await mkdtemp(
                join(AbsoluteFilePath.of(tmpdir()), RelativeFilePath.of("fern-preview-"))
            );
            return AbsoluteFilePath.of(tmpPreviewDirectory);
        }
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
     * When both `path` and `git` are configured (and not already in preview mode),
     * we force preview mode so that the remote generation service produces a full
     * project (i.e. CI workflows, repo URLs in package metadata, etc) without
     * actually pushing to GitHub.
     *
     * The output is downloaded to a temp directory and then copied to `output.path`.
     */
    private isLocalGitCombo(args: LegacyRemoteGenerationRunner.RunArgs): boolean {
        return args.target.output.path != null && args.target.output.git != null && !args.preview;
    }
}
