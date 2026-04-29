import { replaceEnvVariables } from "@fern-api/core-utils";
import type { ValidationViolation } from "@fern-api/docs-validator";
import { validateDocsWorkspace } from "@fern-api/docs-validator";
import type { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { CliError } from "@fern-api/task-context";
import type { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";

/**
 * Validates DocsWorkspaces before publishing.
 *
 * This runs the same validation rules as `fern docs check`:
 *  - validateDocsWorkspace: Validates docs configuration, markdown links, file types, etc.
 */
export namespace DocsWorkspaceValidator {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** The current task, if any */
        task?: Task;
    }

    export interface Result {
        /** All validation violations found */
        violations: ValidationViolation[];

        /** Whether any errors (fatal or error severity) were found */
        hasErrors: boolean;

        /** Whether any warnings (warning severity) were found */
        hasWarnings: boolean;

        /** Time taken to validate in milliseconds */
        elapsedMillis: number;
    }
}

export class DocsWorkspaceValidator {
    private readonly context: Context;
    private readonly taskContext: TaskContextAdapter;

    constructor(config: DocsWorkspaceValidator.Config) {
        this.context = config.context;
        this.taskContext = new TaskContextAdapter({ context: this.context, task: config.task });
    }

    /**
     * Validate a DocsWorkspace.
     *
     * Substitutes environment variables if configured, then runs all docs
     * validation rules against the workspace.
     */
    public async validate({
        workspace,
        apiWorkspaces,
        ossWorkspaces,
        excludeRules
    }: {
        workspace: DocsWorkspace;
        apiWorkspaces: AbstractAPIWorkspace<unknown>[];
        ossWorkspaces: OSSWorkspace[];
        excludeRules?: string[];
    }): Promise<DocsWorkspaceValidator.Result> {
        const startTime = performance.now();

        if (workspace.config.settings?.substituteEnvVars) {
            workspace.config = replaceEnvVariables(workspace.config, {
                onError: (error) => this.taskContext.failAndThrow(error, undefined, { code: CliError.Code.ConfigError })
            });
        }

        const violations = await validateDocsWorkspace(
            workspace,
            this.taskContext,
            apiWorkspaces,
            ossWorkspaces,
            false,
            excludeRules
        );

        return {
            violations,
            hasErrors: violations.some((v) => v.severity === "fatal" || v.severity === "error"),
            hasWarnings: violations.some((v) => v.severity === "warning"),
            elapsedMillis: performance.now() - startTime
        };
    }
}
