import { validateDocsWorkspace } from "@fern-api/docs-validator"
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace"
import { TaskContext } from "@fern-api/task-context"
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader"

import { logViolations } from "./logViolations"

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
    workspace: DocsWorkspace
    apiWorkspaces: AbstractAPIWorkspace<unknown>[]
    ossWorkspaces: OSSWorkspace[]
    context: TaskContext
    logWarnings: boolean
    errorOnBrokenLinks?: boolean
    logSummary?: boolean
    excludeRules?: string[]
}): Promise<{ hasErrors: boolean }> {
    const startTime = performance.now()
    const violations = await validateDocsWorkspace(
        workspace,
        context,
        apiWorkspaces,
        ossWorkspaces,
        false,
        excludeRules
    )
    const elapsedMillis = performance.now() - startTime
    let { hasErrors } = logViolations({
        violations,
        context,
        logWarnings,
        logSummary,
        logBreadcrumbs: false,
        elapsedMillis
    })

    if (errorOnBrokenLinks) {
        hasErrors = hasErrors || violations.some((violation) => violation.name === "valid-markdown-links")
    }

    return { hasErrors }
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
    workspace: DocsWorkspace
    apiWorkspaces: AbstractAPIWorkspace<unknown>[]
    ossWorkspaces: OSSWorkspace[]
    context: TaskContext
    logWarnings: boolean
    errorOnBrokenLinks?: boolean
    excludeRules?: string[]
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        apiWorkspaces,
        ossWorkspaces,
        errorOnBrokenLinks,
        excludeRules
    })

    if (hasErrors) {
        context.failAndThrow()
    }
}
