import type { FernToken } from "@fern-api/auth";
import { extractErrorMessage } from "@fern-api/core-utils";
import type { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import type { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskResult } from "@fern-api/task-context";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";
export declare namespace LegacyDocsPublisher {
    export interface PublishResult {
        success: boolean;
        error?: string;
        url?: string;
    }
}

/**
 * Publishes a docs workspace using the legacy remote generation infrastructure.
 */
export class LegacyDocsPublisher {
    private readonly context: Context;
    private readonly task: Task | undefined;
    private readonly project: Project;
    private readonly docsWorkspace: DocsWorkspace;
    private readonly ossWorkspaces: OSSWorkspace[];
    private readonly token: FernToken;

    constructor({
        context,
        task,
        project,
        docsWorkspace,
        ossWorkspaces,
        token
    }: {
        context: Context;
        task?: Task;
        project: Project;
        docsWorkspace: DocsWorkspace;
        ossWorkspaces: OSSWorkspace[];
        token: FernToken;
    }) {
        this.context = context;
        this.task = task;
        this.project = project;
        this.docsWorkspace = docsWorkspace;
        this.ossWorkspaces = ossWorkspaces;
        this.token = token;
    }

    /**
     * Publish the docs workspace to the given instance.
     */
    public async publish({
        instanceUrl,
        preview,
        skipUpload
    }: {
        instanceUrl: string;
        preview: boolean;
        skipUpload?: boolean;
    }): Promise<LegacyDocsPublisher.PublishResult> {
        const taskContext = new TaskContextAdapter({ context: this.context, task: this.task });
        try {
            const url = await runRemoteGenerationForDocsWorkspace({
                organization: this.project.config.organization,
                apiWorkspaces: this.project.apiWorkspaces,
                ossWorkspaces: this.ossWorkspaces,
                docsWorkspace: this.docsWorkspace,
                context: taskContext,
                token: this.token,
                instanceUrl,
                preview,
                previewId: undefined,
                disableTemplates: undefined,
                skipUpload,
                cliVersion: process.env.CLI_VERSION
            });

            if (taskContext.getResult() === TaskResult.Failure) {
                // Don't extract the error message here — it's already in task.logs.
                return { success: false };
            }

            return { success: true, url };
        } catch (error) {
            return {
                success: false,
                error: extractErrorMessage(error)
            };
        }
    }
}
