import validatePackageName from "validate-npm-package-name";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { validateGeneratorsWorkspace } from "@fern-api/generators-validator";
import { TaskContext } from "@fern-api/task-context";

import { logViolations } from "./logViolations";

export async function validateAPIWorkspaceWithoutExiting({
    workspace,
    context,
    logWarnings,
    logSummary = true
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const apiViolations = validateFernWorkspace(workspace, context.logger);
    const generatorViolations = await validateGeneratorsWorkspace(workspace, context.logger);
    const violations = [...apiViolations, ...generatorViolations];
    const { hasErrors } = logViolations({
        violations,
        context,
        logWarnings,
        logSummary
    });

    return { hasErrors };
}

export async function validateAPIWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    if (!validatePackageName(workspace.definition.rootApiFile.contents.name).validForNewPackages) {
        context.failAndThrow("API name is not valid.");
    }

    const { hasErrors } = await validateAPIWorkspaceWithoutExiting({ workspace, context, logWarnings });

    if (hasErrors) {
        context.failAndThrow();
    }
}
