import type { FernToken } from "@fern-api/auth";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { Rules } from "@fern-api/docs-validator";
import type { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import type { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import { CliError } from "../../errors/CliError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import type { Task } from "../../ui/Task.js";
import { LegacyProjectAdapter } from "../adapter/LegacyProjectAdapter.js";
import { DocsWorkspaceValidator } from "../validator/DocsWorkspaceValidator.js";

export declare namespace LegacyDocsPublisher {
    export interface PublishResult {
        success: boolean;
        error?: string;
    }
}

/**
 * Encapsulates all interaction with the legacy docs publishing infrastructure.
 *
 * Usage:
 *   const publisher = new LegacyDocsPublisher({ context, task });
 *   await publisher.validate({ strict });
 *   const result = await publisher.publish({ instanceUrl, preview });
 */
export class LegacyDocsPublisher {
    private readonly context: Context;
    private readonly adapter: LegacyProjectAdapter;
    private readonly task: Task | undefined;

    private prepared:
        | {
              project: Project;
              docsWorkspace: DocsWorkspace;
              ossWorkspaces: OSSWorkspace[];
              token: FernToken;
          }
        | undefined;

    constructor({ context, task }: { context: Context; task?: Task }) {
        this.context = context;
        this.adapter = new LegacyProjectAdapter({ context });
        this.task = task;
    }

    /**
     * Validate the docs workspace configuration.
     *
     * @throws ValidationError if validation fails.
     *
     * TODO: Extract this out into a separate class. We shouldn't need to cache the "prepared" content
     * here -- it should just be passed in as part of the constructor and handled by an upstream component.
     * The implementation is not ideal as-is -- it should be implemented similar to the `fern sdk generate` command instead.
     */
    public async validate({ strict }: { strict: boolean }): Promise<void> {
        const { docsWorkspace, project, ossWorkspaces } = await this.prepare();

        const isRunningOnSelfHosted = process.env["FERN_FDR_ORIGIN"] != null;
        const excludeRules: string[] = [];
        if (isRunningOnSelfHosted) {
            excludeRules.push(Rules.ValidFileTypes.name);
        }

        const validator = new DocsWorkspaceValidator({ context: this.context, task: this.task });
        const result = await validator.validate({
            workspace: docsWorkspace,
            apiWorkspaces: project.apiWorkspaces,
            ossWorkspaces,
            excludeRules
        });

        if (result.hasErrors || (strict && result.hasWarnings)) {
            const violationsToThrow = strict
                ? result.violations
                : result.violations.filter((v) => v.severity === "fatal" || v.severity === "error");
            throw new ValidationError(violationsToThrow);
        }
    }

    /**
     * Publish the docs workspace to the given instance.
     *
     * Call validate() first to ensure the workspace is valid.
     */
    public async publish({
        instanceUrl,
        preview
    }: {
        instanceUrl: string;
        preview: boolean;
    }): Promise<LegacyDocsPublisher.PublishResult> {
        const { project, docsWorkspace, ossWorkspaces, token } = await this.prepare();

        const taskContext = new TaskContextAdapter({ context: this.context, task: this.task });
        try {
            await runRemoteGenerationForDocsWorkspace({
                organization: project.config.organization,
                apiWorkspaces: project.apiWorkspaces,
                ossWorkspaces,
                docsWorkspace,
                context: taskContext,
                token,
                instanceUrl,
                preview,
                disableTemplates: undefined,
                skipUpload: undefined
            });
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }

        if (taskContext.getResult() === TaskResult.Failure) {
            // Don't extract the error message here — it's already in task.logs.
            return { success: false };
        }

        return { success: true };
    }

    /**
     * Lazily loads and caches the project, docs workspace, OSS workspaces, and auth token.
     */
    private async prepare(): Promise<{
        project: Project;
        docsWorkspace: DocsWorkspace;
        ossWorkspaces: OSSWorkspace[];
        token: FernToken;
    }> {
        if (this.prepared != null) {
            return this.prepared;
        }

        const workspace = await this.context.loadWorkspaceOrThrow();
        const project = this.adapter.adapt(workspace);

        const docsWorkspace = project.docsWorkspaces;
        if (docsWorkspace == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started."
            });
        }

        const isRunningOnSelfHosted = process.env["FERN_FDR_ORIGIN"] != null;
        const ossWorkspaces = await filterOssWorkspaces(project);
        const token = await this.getToken({ isRunningOnSelfHosted });

        if (token.type === "user") {
            // TODO: Check if the organization exists. If not, tell the user to run `fern org create <name>`.
            // That way, it remains an explicit operation instead of the user accidentally creating an organization.
            // We should use the same thing in other commands, such as `fern sdk generate`.
        }

        this.prepared = { project, docsWorkspace, ossWorkspaces, token };
        return this.prepared;
    }

    private getToken({ isRunningOnSelfHosted }: { isRunningOnSelfHosted: boolean }): Promise<FernToken> {
        if (isRunningOnSelfHosted) {
            const fernToken = process.env["FERN_TOKEN"];
            if (fernToken == null) {
                throw new CliError({
                    message: "No organization token found. Please set the FERN_TOKEN environment variable."
                });
            }
            return Promise.resolve({ type: "organization", value: fernToken });
        }
        return this.context.getTokenOrPrompt();
    }
}
