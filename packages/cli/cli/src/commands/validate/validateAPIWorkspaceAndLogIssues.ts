import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { ValidationViolation, validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { validateGeneratorsWorkspace } from "@fern-api/generators-validator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { validateOSSWorkspace } from "@fern-api/oss-validator";
import { TaskContext } from "@fern-api/task-context";
import validatePackageName from "validate-npm-package-name";

import { logViolations } from "./logViolations";

export interface CollectedApiViolations {
    apiName: string;
    violations: ValidationViolation[];
    elapsedMillis: number;
    hasErrors: boolean;
}

export async function collectAPIWorkspaceViolations({
    workspace,
    context,
    ossWorkspace
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    ossWorkspace?: OSSWorkspace;
}): Promise<CollectedApiViolations> {
    if (!validatePackageName(workspace.definition.rootApiFile.contents.name).validForNewPackages) {
        context.failAndThrow("API name is not valid.");
    }

    const startTime = performance.now();
    const apiViolations = validateFernWorkspace(workspace, context.logger);
    const generatorViolations = await validateGeneratorsWorkspace(workspace, context.logger);
    const violations = [...apiViolations, ...generatorViolations];
    if (ossWorkspace) {
        violations.push(...(await validateOSSWorkspace(ossWorkspace, context)));
    }
    const elapsedMillis = performance.now() - startTime;

    const hasErrors = violations.some((v) => v.severity === "fatal" || v.severity === "error");

    return {
        apiName: workspace.definition.rootApiFile.contents.name,
        violations,
        elapsedMillis,
        hasErrors
    };
}

export async function validateAPIWorkspaceWithoutExiting({
    workspace,
    context,
    logWarnings,
    logSummary = true,
    ossWorkspace
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
    ossWorkspace?: OSSWorkspace;
}): Promise<{ hasErrors: boolean }> {
    const startTime = performance.now();
    const apiViolations = validateFernWorkspace(workspace, context.logger);
    const generatorViolations = await validateGeneratorsWorkspace(workspace, context.logger);
    const violations = [...apiViolations, ...generatorViolations];
    if (ossWorkspace) {
        violations.push(...(await validateOSSWorkspace(ossWorkspace, context)));
    }
    const elapsedMillis = performance.now() - startTime;
    const { hasErrors } = logViolations({
        violations,
        context,
        logWarnings,
        logSummary,
        elapsedMillis
    });

    return { hasErrors };
}

export async function validateAPIWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings,
    ossWorkspace
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
    ossWorkspace?: OSSWorkspace;
}): Promise<void> {
    if (!validatePackageName(workspace.definition.rootApiFile.contents.name).validForNewPackages) {
        context.failAndThrow("API name is not valid.");
    }

    const { hasErrors } = await validateAPIWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        ossWorkspace
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
