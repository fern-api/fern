import { replaceEnvVariables } from "@fern-api/core-utils";
import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

import { logViolations } from "./logViolations";

export interface CollectedDocsViolations {
    violations: ValidationViolation[];
    elapsedMillis: number;
    hasErrors: boolean;
}

export async function collectDocsWorkspaceViolations({
    workspace,
    apiWorkspaces,
    ossWorkspaces,
    context,
    errorOnBrokenLinks,
    excludeRules
}: {
    workspace: DocsWorkspace;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    context: TaskContext;
    errorOnBrokenLinks?: boolean;
    excludeRules?: string[];
}): Promise<CollectedDocsViolations> {
    // Apply env var substitution if settings.substitute-env-vars is enabled
    if (workspace.config.settings?.substituteEnvVars) {
        workspace.config = replaceEnvVariables(workspace.config, {
            onError: (e) => context.failAndThrow(e)
        });
    }

    const startTime = performance.now();
    const violations = await validateDocsWorkspace(
        workspace,
        context,
        apiWorkspaces,
        ossWorkspaces,
        false,
        excludeRules
    );
    const elapsedMillis = performance.now() - startTime;

    let hasErrors = violations.some((v) => v.severity === "fatal" || v.severity === "error");
    if (errorOnBrokenLinks) {
        hasErrors = hasErrors || violations.some((violation) => violation.name === "valid-markdown-links");
    }

    return {
        violations,
        elapsedMillis,
        hasErrors
    };
}

export interface ValidationMetrics {
    hasErrors: boolean;
    errorCount: number;
    warningCount: number;
    totalViolationCount: number;
    violationsBySeverity: Record<string, number>;
    elapsedMillis: number;
}

export async function validateDocsWorkspaceWithoutExiting({
    workspace,
    apiWorkspaces,
    ossWorkspaces,
    context,
    logWarnings,
    errorOnBrokenLinks,
    logSummary = true,
    excludeRules
}: {
    workspace: DocsWorkspace;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    errorOnBrokenLinks?: boolean;
    logSummary?: boolean;
    excludeRules?: string[];
}): Promise<ValidationMetrics> {
    // Apply env var substitution if settings.substitute-env-vars is enabled
    // This matches the behavior of `fern generate --docs` which throws errors for missing env vars
    // The entire config including instances (with custom domains) goes through substitution
    if (workspace.config.settings?.substituteEnvVars) {
        workspace.config = replaceEnvVariables(workspace.config, {
            onError: (e) => context.failAndThrow(e)
        });
    }

    const startTime = performance.now();
    const violations = await validateDocsWorkspace(
        workspace,
        context,
        apiWorkspaces,
        ossWorkspaces,
        false,
        excludeRules
    );
    const elapsedMillis = performance.now() - startTime;
    let { hasErrors } = logViolations({
        violations,
        context,
        logWarnings,
        logSummary,
        logBreadcrumbs: false,
        elapsedMillis
    });

    if (errorOnBrokenLinks) {
        hasErrors = hasErrors || violations.some((violation) => violation.name === "valid-markdown-links");
    }

    // Calculate detailed validation metrics
    let errorCount = 0;
    let warningCount = 0;
    const violationsBySeverity: Record<string, number> = {};

    for (const violation of violations) {
        if (violation.severity === "fatal" || violation.severity === "error") {
            errorCount++;
        } else if (violation.severity === "warning") {
            warningCount++;
        }
        violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] ?? 0) + 1;
    }

    return {
        hasErrors,
        errorCount,
        warningCount,
        totalViolationCount: violations.length,
        violationsBySeverity,
        elapsedMillis
    };
}

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    apiWorkspaces,
    ossWorkspaces,
    context,
    logWarnings,
    errorOnBrokenLinks,
    excludeRules
}: {
    workspace: DocsWorkspace;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    errorOnBrokenLinks?: boolean;
    excludeRules?: string[];
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        apiWorkspaces,
        ossWorkspaces,
        errorOnBrokenLinks,
        excludeRules
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
