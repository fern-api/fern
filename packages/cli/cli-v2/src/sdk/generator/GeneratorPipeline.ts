import type { FernToken } from "@fern-api/auth";
import type { Audiences } from "@fern-api/configuration";
import type { ContainerRunner } from "@fern-api/core-utils";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { AiConfig } from "../../ai/config/AiConfig";
import type { ApiDefinition } from "../../api/config/ApiDefinition";
import type { Context } from "../../context/Context";
import { CliError } from "../../errors/CliError";
import type { Task } from "../../ui/Task";
import type { Target } from "../config/Target";
import { LegacyGenerationRunner } from "./LegacyGenerationRunner";
import { LegacyRemoteGenerationRunner } from "./LegacyRemoteGenerationRunner";

/**
 * Orchestrates SDK generation for a single target.
 *
 * The pipeline delegates to the legacy local-generation and remote-generation infrastructure
 * for actual code generation, ensuring all of the original logic is reused:
 *  - IR generation and migration
 *  - Docker container execution
 *  - Zip extraction
 *  - .fernignore handling
 *  - Auto-versioning
 *  - Snippet generation
 */
export namespace GeneratorPipeline {
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

        /** The name of the organization */
        organization: string;

        /** Execution runtime */
        runtime: "local" | "remote";

        /** AI services configuration */
        ai?: AiConfig;

        /** Container engine to use for local generation */
        containerEngine?: ContainerRunner;

        /** Whether to keep containers after completion */
        keepContainer?: boolean;

        /** Whether this is a preview/dry-run */
        preview?: boolean;

        /** Audiences to filter by */
        audiences?: Audiences;

        /** Version override (if not using target's version) */
        version?: string;

        /** Output path override */
        outputPath?: AbsoluteFilePath;

        /** Fern authentication token (required for remote generation) */
        token?: FernToken;

        /** Whether to log S3 URLs (for remote generation) */
        shouldLogS3Url?: boolean;

        /** Path to .fernignore file */
        fernignorePath?: string;
    }

    export interface Result {
        /** Whether generation succeeded */
        success: boolean;

        /** The target that was generated */
        target: Target;

        /** Paths and/or URLs to generated output */
        output?: string[];

        /** Error message (on failure) */
        error?: string;
    }
}

export class GeneratorPipeline {
    private readonly context: Context;
    private readonly cliVersion: string;

    constructor(config: GeneratorPipeline.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
    }

    /**
     * Run generation for a single target.
     */
    public async run(args: GeneratorPipeline.RunArgs): Promise<GeneratorPipeline.Result> {
        try {
            if (args.runtime === "local") {
                return await this.runLocalGeneration(args);
            }
            return await this.runRemoteGeneration(args);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                target: args.target,
                error: message
            };
        }
    }

    private async runLocalGeneration(args: GeneratorPipeline.RunArgs): Promise<GeneratorPipeline.Result> {
        const generationRunner = new LegacyGenerationRunner({
            context: this.context,
            cliVersion: this.cliVersion
        });
        const result = await generationRunner.run({
            target: args.target,
            apiDefinition: args.apiDefinition,
            organization: args.organization,
            ai: args.ai,
            audiences: args.audiences,
            version: args.version,
            keepContainer: args.keepContainer,
            preview: args.preview,
            outputPath: args.outputPath,
            task: args.task,
            containerEngine: args.containerEngine
        });
        if (!result.success) {
            return {
                success: false,
                target: args.target,
                error: result.error
            };
        }
        return {
            success: true,
            target: args.target,
            output: result.output
        };
    }

    private async runRemoteGeneration(args: GeneratorPipeline.RunArgs): Promise<GeneratorPipeline.Result> {
        if (args.token == null) {
            throw CliError.authRequired();
        }
        const runner = new LegacyRemoteGenerationRunner({
            context: this.context,
            cliVersion: this.cliVersion
        });
        const result = await runner.run({
            target: args.target,
            apiDefinition: args.apiDefinition,
            organization: args.organization,
            token: args.token,
            ai: args.ai,
            audiences: args.audiences,
            version: args.version,
            shouldLogS3Url: args.shouldLogS3Url,
            preview: args.preview,
            outputPath: args.outputPath,
            fernignorePath: args.fernignorePath,
            task: args.task
        });
        if (!result.success) {
            return {
                success: false,
                target: args.target,
                error: result.error
            };
        }
        return {
            success: true,
            target: args.target,
            output: result.output
        };
    }
}
