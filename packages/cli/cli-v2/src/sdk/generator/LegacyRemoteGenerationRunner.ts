import type { FernToken } from "@fern-api/auth";
import type { Audiences } from "@fern-api/configuration";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { LegacyFernWorkspaceAdapter } from "../../api/adapter/LegacyFernWorkspaceAdapter";
import type { ApiDefinition } from "../../api/config/ApiDefinition";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter";
import type { Context } from "../../context/Context";
import { LegacyGeneratorInvocationAdapter } from "../adapter/LegacyGeneratorInvocationAdapter";
import type { Target } from "../config/Target";

/**
 * Runs remote generation using the v1 remote-generation infrastructure.
 *
 * This class bridges v2 types (Target, ApiDefinition) to the v1 infrastructure,
 * reusing all the battle-tested logic for:
 *  - IR generation
 *  - API registration with FDR
 *  - Source file uploading
 *  - Remote job creation and polling
 *  - Dynamic IR uploading
 */
export namespace LegacyRemoteGenerationRunner {
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

        /** Fern authentication token */
        token: FernToken;

        /** Audiences to filter by */
        audiences?: Audiences;

        /** Version override for the generated SDK */
        version?: string;

        /** Whether to log S3 URLs */
        shouldLogS3Url?: boolean;

        /** Whether this is a preview/dry-run */
        preview?: boolean;

        /** Path to .fernignore file */
        fernignorePath?: string;
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

export class LegacyRemoteGenerationRunner {
    private readonly context: Context;
    private readonly cliVersion: string;
    private readonly workspaceAdapter: LegacyFernWorkspaceAdapter;
    private readonly invocationAdapter: LegacyGeneratorInvocationAdapter;

    constructor(config: LegacyRemoteGenerationRunner.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
        this.workspaceAdapter = new LegacyFernWorkspaceAdapter({
            context: this.context,
            cliVersion: config.cliVersion
        });
        this.invocationAdapter = new LegacyGeneratorInvocationAdapter({ context: this.context });
    }

    public async run(args: LegacyRemoteGenerationRunner.RunArgs): Promise<LegacyRemoteGenerationRunner.Result> {
        const taskContext = new TaskContextAdapter({ context: this.context, badge: args.target.name });
        try {
            const generatorInvocation = this.invocationAdapter.adapt(args.target);
            const generatorGroup: generatorsYml.GeneratorGroup = {
                groupName: args.target.name,
                audiences: args.audiences ?? { type: "all" },
                generators: [generatorInvocation],
                reviewers: undefined
            };

            const absolutePathToPreview = args.preview
                ? this.context.resolveOutputPath(args.target.output.path)
                : undefined;

            const fernWorkspace = await this.workspaceAdapter.adapt(args.apiDefinition);

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

            // Step 7: Resolve output path for result
            const absolutePathToLocalOutput = this.context.resolveOutputPath(args.target.output.path);

            return {
                success: true,
                outputPath: absolutePathToLocalOutput
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: message
            };
        }
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
