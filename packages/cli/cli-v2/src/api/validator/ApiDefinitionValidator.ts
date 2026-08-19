import type { FernWorkspace } from "@fern-api/api-workspace-commons";
import { ValidationViolation, validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { validateOSSWorkspace } from "@fern-api/oss-validator";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import { Task } from "../../ui/Task.js";
import { LegacyApiSpecAdapter, partitionV1Specs } from "../adapter/LegacyApiSpecAdapter.js";
import type { ApiDefinition } from "../config/ApiDefinition.js";
import type { ApiSpec } from "../config/ApiSpec.js";
import { isConjureSpec } from "../config/ConjureSpec.js";
import type { FernSpec } from "../config/FernSpec.js";
import { isFernSpec } from "../config/FernSpec.js";

/**
 * Validates ApiDefinitions before generation.
 *
 * This runs the same validation rules as `fern check`:
 *  - validateFernWorkspace: Validates Fern definition structure and semantics
 *  - validateOSSWorkspace: Validates OpenAPI/AsyncAPI specs
 */
export namespace ApiDefinitionValidator {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;

        /** The current task, if any */
        task?: Task;
    }

    export interface Result {
        /** All validation violations found */
        violations: ValidationViolation[];

        /** The absolute path to the definition root (violation paths are relative to this) */
        workspaceRoot: AbsoluteFilePath;

        /** Whether any errors (fatal or error severity) were found */
        hasErrors: boolean;

        /** Time taken to validate in milliseconds */
        elapsedMillis: number;
    }
}

export class ApiDefinitionValidator {
    private readonly context: Context;
    private readonly taskContext: TaskContextAdapter;
    private readonly cliVersion: string;

    constructor(config: ApiDefinitionValidator.Config) {
        this.context = config.context;
        this.taskContext = new TaskContextAdapter({ context: this.context, task: config.task });
        this.cliVersion = config.cliVersion;
    }

    /**
     * Validate an ApiDefinition.
     *
     * Runs both Fern definition validation and OSS workspace validation
     * to ensure the API definition is valid before generation.
     */
    public async validate(definition: ApiDefinition): Promise<ApiDefinitionValidator.Result> {
        const startTime = performance.now();
        const violations: ValidationViolation[] = [];

        const fernSpec = definition.specs.find(isFernSpec);
        if (fernSpec != null) {
            const fernViolations = await this.validateFernSpec(fernSpec);
            violations.push(...fernViolations);
            return {
                violations,
                hasErrors: violations.some((v) => v.severity === "fatal" || v.severity === "error"),
                workspaceRoot: fernSpec.fern,
                elapsedMillis: performance.now() - startTime
            };
        }

        const conjureSpec = definition.specs.find(isConjureSpec);
        if (conjureSpec != null) {
            return {
                violations: [],
                hasErrors: false,
                workspaceRoot: this.context.cwd,
                elapsedMillis: performance.now() - startTime
            };
        }

        const ossViolations = await this.validateOssSpecs(definition.specs);
        violations.push(...ossViolations);

        return {
            violations,
            hasErrors: violations.some((v) => v.severity === "fatal" || v.severity === "error"),
            workspaceRoot: this.context.cwd,
            elapsedMillis: performance.now() - startTime
        };
    }

    private async validateFernSpec(spec: FernSpec): Promise<ValidationViolation[]> {
        const violations: ValidationViolation[] = [];

        const lazyWorkspace = new LazyFernWorkspace({
            absoluteFilePath: dirname(spec.fern),
            context: this.taskContext,
            cliVersion: this.cliVersion,
            generatorsConfiguration: undefined,
            workspaceName: undefined,
            changelog: undefined
        });

        const fernWorkspace = await lazyWorkspace.toFernWorkspace({ context: this.taskContext });

        const fernViolations = validateFernWorkspace(fernWorkspace, this.context.stderr);
        violations.push(...fernViolations);

        return violations;
    }

    private async validateOssSpecs(specs: ApiSpec[]): Promise<ValidationViolation[]> {
        const violations: ValidationViolation[] = [];

        const ossSpecs = specs.filter((spec) => !isFernSpec(spec) && !isConjureSpec(spec));
        if (ossSpecs.length === 0) {
            return violations;
        }

        const specAdapter = new LegacyApiSpecAdapter({ context: this.context });
        const v1Specs = specAdapter.convertAll(ossSpecs);
        const { filteredSpecs, allSpecs } = partitionV1Specs(v1Specs);

        // GraphQL-only APIs have no IR-generating specs; nothing to validate via OSSWorkspace.
        if (filteredSpecs.length === 0) {
            return violations;
        }

        const ossWorkspace = new OSSWorkspace({
            specs: filteredSpecs,
            allSpecs,
            absoluteFilePath: this.context.cwd,
            cliVersion: this.cliVersion,
            changelog: undefined,
            generatorsConfiguration: undefined,
            workspaceName: undefined
        });

        const fernWorkspace: FernWorkspace = await ossWorkspace.toFernWorkspace({ context: this.taskContext });

        const fernViolations = validateFernWorkspace(fernWorkspace, this.context.stderr);
        violations.push(...fernViolations);

        const ossViolations = await validateOSSWorkspace(ossWorkspace, this.taskContext);
        violations.push(...ossViolations);

        return violations;
    }
}
