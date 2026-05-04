import { assertNever } from "@fern-api/core-utils";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import type { ValidationViolation } from "@fern-api/docs-validator";
import { Rules } from "@fern-api/docs-validator";
import { CliError } from "@fern-api/task-context";

import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { LegacyProjectAdapter } from "../adapter/LegacyProjectAdapter.js";
import { DocsWorkspaceValidator } from "../validator/DocsWorkspaceValidator.js";

export declare namespace DocsChecker {
    /**
     * A docs validation violation with resolved file path relative to user's cwd.
     */
    export interface ResolvedViolation extends ValidationViolation {
        /** File path relative to user's current working directory */
        displayRelativeFilepath: string;
        /** The line number in the file */
        line: number;
        /** The column number in the file */
        column: number;
    }

    export interface Config {
        /** The CLI context */
        context: Context;

        /** The current task, if any */
        task?: Task;
    }

    export interface Result {
        /** Resolved violations to display */
        violations: DocsChecker.ResolvedViolation[];

        /** Whether any errors (fatal or error severity) were found */
        hasErrors: boolean;

        /** Whether any warnings were found */
        hasWarnings: boolean;

        /** Total error count */
        errorCount: number;

        /** Total warning count */
        warningCount: number;

        /** Time taken in milliseconds */
        elapsedMillis: number;
    }
}

export class DocsChecker {
    private readonly context: Context;
    private readonly task: Task | undefined;

    constructor(config: DocsChecker.Config) {
        this.context = config.context;
        this.task = config.task;
    }

    /**
     * Check docs configuration in the workspace and return results.
     */
    public async check({
        workspace,
        strict = false
    }: {
        workspace: Workspace;
        strict?: boolean;
    }): Promise<DocsChecker.Result> {
        if (workspace.docs == null) {
            return {
                violations: [],
                hasErrors: false,
                hasWarnings: false,
                errorCount: 0,
                warningCount: 0,
                elapsedMillis: 0
            };
        }

        const adapter = new LegacyProjectAdapter({ context: this.context });
        const project = await adapter.adapt(workspace);

        const docsWorkspace = project.docsWorkspaces;
        if (docsWorkspace == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const ossWorkspaces = await filterOssWorkspaces(project);

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

        const resolvedViolations = result.violations.map((v) => this.resolveViolation({ workspace, violation: v }));

        const counts = this.countViolations(resolvedViolations);
        return {
            ...counts,
            hasErrors: result.hasErrors,
            hasWarnings: result.hasWarnings,
            violations: strict
                ? resolvedViolations
                : resolvedViolations.filter((v) => v.severity === "fatal" || v.severity === "error"),
            elapsedMillis: result.elapsedMillis
        };
    }

    private resolveViolation({
        workspace,
        violation
    }: {
        workspace: Workspace;
        violation: ValidationViolation;
    }): DocsChecker.ResolvedViolation {
        const location = workspace.fernYml?.sourced.docs?.$loc;
        return {
            ...violation,
            relativeFilepath: location?.relativeFilePath ?? violation.relativeFilepath,
            displayRelativeFilepath: location?.relativeFilePath ?? violation.relativeFilepath,
            line: location?.line ?? 1,
            column: location?.column ?? 1
        };
    }

    private countViolations(violations: DocsChecker.ResolvedViolation[]): { errorCount: number; warningCount: number } {
        let errorCount = 0;
        let warningCount = 0;

        for (const violation of violations) {
            switch (violation.severity) {
                case "fatal":
                case "error":
                    errorCount++;
                    break;
                case "warning":
                    warningCount++;
                    break;
                default:
                    assertNever(violation.severity);
            }
        }

        return { errorCount, warningCount };
    }
}
