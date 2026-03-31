import { assertNever } from "@fern-api/core-utils";
import type { ValidationViolation } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, join, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import type { Context } from "../../context/Context.js";
import { Task } from "../../ui/Task.js";
import type { Workspace } from "../../workspace/Workspace.js";
import type { ApiDefinition } from "../config/ApiDefinition.js";
import type { ApiSpecType } from "../config/ApiSpec.js";
import type { AsyncApiSpec } from "../config/AsyncApiSpec.js";
import { isAsyncApiSpec } from "../config/AsyncApiSpec.js";
import { isFernSpec } from "../config/FernSpec.js";
import type { OpenApiSpec } from "../config/OpenApiSpec.js";
import { isOpenApiSpec } from "../config/OpenApiSpec.js";
import { ApiDefinitionValidator } from "../validator/ApiDefinitionValidator.js";

export declare namespace ApiChecker {
    /**
     * A validation violation with resolved file path relative to user's cwd.
     */
    export interface ResolvedViolation extends ValidationViolation {
        /** The API name this violation belongs to */
        apiName: string;
        /** The type of spec this violation originates from */
        apiSpecType: ApiSpecType;
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

        /** CLI version for workspace metadata */
        cliVersion: string;

        /** The current task, if any */
        task?: Task;
    }

    export interface Result {
        /** APIs that passed validation (no errors) */
        validApis: Set<string>;

        /** APIs that failed validation (have errors) */
        invalidApis: Set<string>;

        /** Resolved violations to display */
        violations: ApiChecker.ResolvedViolation[];

        /** Total error count */
        errorCount: number;

        /** Total warning count */
        warningCount: number;

        /** Time taken in milliseconds */
        elapsedMillis: number;
    }
}

export class ApiChecker {
    private readonly context: Context;
    private readonly cliVersion: string;
    private readonly task: Task | undefined;

    constructor(config: ApiChecker.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
        this.task = config.task;
    }

    /**
     * Check APIs in the workspace and display results.
     *
     * @param strict - If true, display all warnings and treat them as errors. If false,
     *                 only show errors but still report warning count in summary.
     */
    public async check({
        workspace,
        apiNames,
        strict = false
    }: {
        workspace: Workspace;
        apiNames?: string[];
        strict?: boolean;
    }): Promise<ApiChecker.Result> {
        const startTime = performance.now();
        const validApis = new Set<string>();
        const invalidApis = new Set<string>();

        const apisToCheck = apiNames ?? Object.keys(workspace.apis);
        if (apisToCheck.length === 0) {
            return {
                validApis,
                invalidApis,
                violations: [],
                errorCount: 0,
                warningCount: 0,
                elapsedMillis: performance.now() - startTime
            };
        }

        const validator = new ApiDefinitionValidator({
            context: this.context,
            cliVersion: this.cliVersion,
            task: this.task
        });

        const allViolations: ApiChecker.ResolvedViolation[] = [];
        for (const apiName of apisToCheck) {
            const apiDefinition = workspace.apis[apiName];
            if (apiDefinition == null) {
                invalidApis.add(apiName);
                continue;
            }

            const result = await validator.validate(apiDefinition);
            if (result.hasErrors) {
                invalidApis.add(apiName);
            } else {
                validApis.add(apiName);
            }

            const apiSpecType: ApiSpecType = apiDefinition.specs.some(isFernSpec) ? "fern" : "openapi";
            const resolvedViolations = this.resolveViolationPaths({
                workspaceRoot: result.workspaceRoot,
                apiName,
                apiSpecType,
                apiDefinition,
                violations: result.violations
            });
            allViolations.push(...resolvedViolations);
        }

        const dedupedViolations = this.deduplicateViolations(allViolations);
        return {
            ...this.countViolations(dedupedViolations),
            validApis,
            invalidApis,
            violations: strict
                ? dedupedViolations
                : dedupedViolations.filter((v) => v.severity === "fatal" || v.severity === "error"),
            elapsedMillis: performance.now() - startTime
        };
    }

    private resolveViolationPaths({
        violations,
        workspaceRoot,
        apiName,
        apiSpecType,
        apiDefinition
    }: {
        violations: ValidationViolation[];
        workspaceRoot: AbsoluteFilePath;
        apiName: string;
        apiSpecType: ApiSpecType;
        apiDefinition: ApiDefinition;
    }): ApiChecker.ResolvedViolation[] {
        return violations.map((violation) => {
            const message = apiSpecType === "fern" ? violation.message : this.formatOssMessage(violation);
            return {
                ...violation,
                message,
                displayRelativeFilepath: this.resolveDisplayPath({
                    workspaceRoot,
                    apiDefinition,
                    apiSpecType,
                    violation
                }),
                apiSpecType,
                apiName,

                // We don't actually surface valuable line/column information yet, but
                // this at least points to the correct file.
                line: 1,
                column: 1
            };
        });
    }

    /**
     * Format a violation message for non-Fern (OSS) specs.
     *
     * Prepends a human-readable node path so users can locate the endpoint,
     * then strips synthetic file paths from the body of the message.
     */
    private formatOssMessage(violation: ValidationViolation): string {
        const strippedMessage = this.stripSyntheticFilePaths(violation.message);
        const nodePathPrefix = this.formatNodePath(violation.nodePath);
        if (nodePathPrefix.length === 0) {
            return strippedMessage;
        }
        return `${nodePathPrefix} - ${strippedMessage}`;
    }

    /**
     * Formats a NodePath into a readable string like "endpoints -> getUser".
     *
     * Skips the leading "service" segment since it's implicit.
     */
    private formatNodePath(nodePath: ValidationViolation["nodePath"]): string {
        const parts: string[] = [];
        for (const item of nodePath) {
            if (typeof item === "string") {
                parts.push(item);
            } else {
                parts.push(item.key);
            }
        }
        // Drop the leading "service" — it's noise for OSS specs.
        if (parts[0] === "service") {
            parts.shift();
        }
        return parts.join(" -> ");
    }

    private resolveDisplayPath({
        workspaceRoot,
        apiDefinition,
        apiSpecType,
        violation
    }: {
        workspaceRoot: AbsoluteFilePath;
        apiDefinition: ApiDefinition;
        apiSpecType: ApiSpecType;
        violation: ValidationViolation;
    }): string {
        if (apiSpecType === "fern") {
            const absolutePath = join(workspaceRoot, RelativeFilePath.of(violation.relativeFilepath));
            return relativize(this.context.cwd, absolutePath);
        }
        return this.resolveOssDisplayPath(apiDefinition, violation);
    }

    private resolveOssDisplayPath(apiDefinition: ApiDefinition, violation: ValidationViolation): string {
        const ossSpecs = apiDefinition.specs.filter(
            (s): s is OpenApiSpec | AsyncApiSpec => isOpenApiSpec(s) || isAsyncApiSpec(s)
        );
        if (ossSpecs.length === 0) {
            return violation.relativeFilepath;
        }
        // For multi-spec with namespaces, try matching by namespace.
        if (ossSpecs.length > 1) {
            for (const spec of ossSpecs) {
                const namespace = isOpenApiSpec(spec) ? spec.namespace : spec.namespace;
                if (namespace != null && violation.relativeFilepath.startsWith(namespace)) {
                    const filePath = isOpenApiSpec(spec) ? spec.openapi : spec.asyncapi;
                    return relativize(this.context.cwd, filePath);
                }
            }
        }
        // Default to first OSS spec.
        const firstSpec = ossSpecs[0];
        if (firstSpec == null) {
            return violation.relativeFilepath;
        }
        const filePath = isOpenApiSpec(firstSpec) ? firstSpec.openapi : firstSpec.asyncapi;
        return relativize(this.context.cwd, filePath);
    }

    private deduplicateViolations(violations: ApiChecker.ResolvedViolation[]): ApiChecker.ResolvedViolation[] {
        const seen = new Set<string>();
        return violations.filter((v) => {
            const key = `${v.apiName}|${v.displayRelativeFilepath}|${v.severity}|${JSON.stringify(v.nodePath)}|${v.message}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Strip synthetic file path references from violation messages for non-Fern specs.
     *
     * The validator produces messages like:
     *   "- pet.yml -> getPetById /pet/{petId}"
     * For non-Fern specs these file names are synthetic (they don't exist on disk),
     * so we strip them to produce:
     *   "- getPetById /pet/{petId}"
     */
    private stripSyntheticFilePaths(message: string): string {
        return message.replace(/^(\s*- )\S+\.[a-zA-Z]+ -> /gm, "$1");
    }

    private countViolations(violations: ApiChecker.ResolvedViolation[]): { errorCount: number; warningCount: number } {
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
