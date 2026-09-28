import { logViolations } from "@fern-api/api-workspace-validator";
import { docsYml } from "@fern-api/configuration";
import { getRuleNamesConfiguredAsErrors, validateDocsWorkspace } from "@fern-api/docs-validator";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { CliError, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

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
    workspace.config = docsYml.applyDocsSubstitutions(workspace.config, workspace.config, {
        onError: (e) => context.failAndThrow(e, undefined, { code: CliError.Code.ValidationError })
    });

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
}): Promise<{ hasErrors: boolean }> {
    // This matches the behavior of `fern generate --docs` which throws errors for missing substitutions
    // The entire config including instances (with custom domains) goes through substitution
    workspace.config = docsYml.applyDocsSubstitutions(workspace.config, workspace.config, {
        onError: (e) => context.failAndThrow(e, undefined, { code: CliError.Code.ValidationError })
    });

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

    const rulesConfiguredAsErrors = getRuleNamesConfiguredAsErrors(workspace.config.check);
    hasErrors =
        hasErrors ||
        violations.some(
            (violation) =>
                violation.severity === "error" && violation.name != null && rulesConfiguredAsErrors.has(violation.name)
        );

    if (errorOnBrokenLinks) {
        hasErrors = hasErrors || violations.some((violation) => violation.name === "valid-markdown-links");
    }

    return { hasErrors };
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
        context.failAndThrow(undefined, undefined, { code: CliError.Code.ValidationError });
    }
}
