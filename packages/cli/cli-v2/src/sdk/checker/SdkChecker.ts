import { type ValidationViolation } from "@fern-api/fern-definition-validator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";
import { isGraphQlSpec } from "../../api/config/GraphQlSpec.js";
import type { Context } from "../../context/Context.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { getGeneratorIdFromImage } from "../config/converter/getGeneratorIdFromImage.js";
import type { SdkConfig } from "../config/SdkConfig.js";
import type { Target } from "../config/Target.js";

export declare namespace SdkChecker {
    export type VersionChecker = (args: { target: Target }) => Promise<{ violation: ValidationViolation | undefined }>;

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

        /** Override version checking (defaults to registry lookup). Useful for testing. */
        versionChecker?: VersionChecker;
    }

    export interface Result {
        /** Resolved violations to display */
        violations: SdkChecker.ResolvedViolation[];

        /** Total error count */
        errorCount: number;

        /** Total warning count */
        warningCount: number;

        /** Time taken in milliseconds */
        elapsedMillis: number;
    }
}

export class SdkChecker {
    private readonly versionChecker: SdkChecker.VersionChecker;

    constructor(config: SdkChecker.Config) {
        this.versionChecker = config.versionChecker ?? ((args) => this.checkVersionExists(args));
    }

    /**
     * Check SDK configuration in the workspace and display results.
     */
    public async check({ workspace }: { workspace: Workspace }): Promise<SdkChecker.Result> {
        const startTime = performance.now();
        const violations: SdkChecker.ResolvedViolation[] = [];

        const fernYml = workspace.fernYml;
        if (workspace.sdks == null || fernYml == null) {
            return {
                violations: [],
                errorCount: 0,
                warningCount: 0,
                elapsedMillis: performance.now() - startTime
            };
        }

        const sdks = workspace.sdks;
        const fernYmlRelativePath = fernYml.relativeFilePath;

        this.validateRequiresApi({ workspace, sdks, fernYmlRelativePath, violations });
        this.validateTargetApiReferences({ workspace, sdks, violations });
        this.validateDefaultGroup({ sdks, fernYmlRelativePath, violations });
        this.validateEmptyVersions({ sdks, violations });
        this.validateGraphQlSpecs({ workspace, sdks, violations });
        await this.validateVersions({ sdks, violations });

        return {
            violations,
            ...this.countViolations(violations),
            elapsedMillis: performance.now() - startTime
        };
    }

    /**
     * Checks if SDKs are configured but no APIs are defined.
     */
    private validateRequiresApi({
        workspace,
        sdks: _sdks,
        fernYmlRelativePath,
        violations
    }: {
        workspace: Workspace;
        sdks: SdkConfig;
        fernYmlRelativePath: RelativeFilePath;
        violations: SdkChecker.ResolvedViolation[];
    }): void {
        if (Object.keys(workspace.apis).length === 0) {
            violations.push({
                severity: "error",
                relativeFilepath: fernYmlRelativePath,
                nodePath: ["sdks"],
                message: "SDKs are configured but no APIs are defined",
                displayRelativeFilepath: fernYmlRelativePath,
                line: 1,
                column: 1
            });
        }
    }

    /**
     * Checks if a target's `api` reference does not match any defined API.
     */
    private validateTargetApiReferences({
        workspace,
        sdks,
        violations
    }: {
        workspace: Workspace;
        sdks: SdkConfig;
        violations: SdkChecker.ResolvedViolation[];
    }): void {
        for (const target of sdks.targets) {
            if (workspace.apis[target.api] == null) {
                violations.push({
                    severity: "error",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "api"],
                    message: `API '${target.api}' is not defined`,
                    displayRelativeFilepath: target.sourceLocation.relativeFilePath,
                    line: target.sourceLocation.line,
                    column: target.sourceLocation.column
                });
            }
        }
    }

    /**
     * Checks if defaultGroup is set but no target references it in its groups array.
     */
    private validateDefaultGroup({
        sdks,
        fernYmlRelativePath,
        violations
    }: {
        sdks: SdkConfig;
        fernYmlRelativePath: RelativeFilePath;
        violations: SdkChecker.ResolvedViolation[];
    }): void {
        const defaultGroup = sdks.defaultGroup;
        if (defaultGroup == null) {
            return;
        }
        const isReferenced = sdks.targets.some(
            (target) => target.groups != null && target.groups.includes(defaultGroup)
        );
        if (!isReferenced) {
            const location = sdks.defaultGroupLocation;
            violations.push({
                severity: "error",
                relativeFilepath: location?.relativeFilePath ?? fernYmlRelativePath,
                nodePath: ["sdks", "defaultGroup"],
                message: `Default group '${defaultGroup}' is not referenced by any target`,
                displayRelativeFilepath: location?.relativeFilePath ?? fernYmlRelativePath,
                line: location?.line ?? 1,
                column: location?.column ?? 1
            });
        }
    }

    /**
     * Checks if a target has an empty version string.
     */
    private validateEmptyVersions({
        sdks,
        violations
    }: {
        sdks: SdkConfig;
        violations: SdkChecker.ResolvedViolation[];
    }): void {
        for (const target of sdks.targets) {
            if (target.version.length === 0) {
                violations.push({
                    severity: "error",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "version"],
                    message: "Version must not be empty",
                    displayRelativeFilepath: target.sourceLocation.relativeFilePath,
                    line: target.sourceLocation.line,
                    column: target.sourceLocation.column
                });
            }
        }
    }

    /**
     * Emits a warning for any target whose referenced API contains a GraphQL spec.
     * GraphQL SDKs are not supported; the graphql specs will be skipped during generation.
     */
    private validateGraphQlSpecs({
        workspace,
        sdks,
        violations
    }: {
        workspace: Workspace;
        sdks: SdkConfig;
        violations: SdkChecker.ResolvedViolation[];
    }): void {
        for (const target of sdks.targets) {
            const api = workspace.apis[target.api];
            if (api == null) {
                continue;
            }
            const hasGraphQl = api.specs.some(isGraphQlSpec);
            if (!hasGraphQl) {
                continue;
            }
            violations.push({
                severity: "warning",
                relativeFilepath: target.sourceLocation.relativeFilePath,
                nodePath: ["sdks", "targets", target.name, "api"],
                message: `API '${target.api}' contains a GraphQL spec. GraphQL SDKs are not supported and graphql specs will be skipped for this target.`,
                displayRelativeFilepath: target.sourceLocation.relativeFilePath,
                line: target.sourceLocation.line,
                column: target.sourceLocation.column
            });
        }
    }

    /**
     * Checks that pinned versions exist in the registry.
     */
    private async validateVersions({
        sdks,
        violations
    }: {
        sdks: SdkConfig;
        violations: SdkChecker.ResolvedViolation[];
    }): Promise<void> {
        const results = await Promise.all(
            sdks.targets.map(async (target) => {
                const result = await this.versionChecker({ target });
                return { target, violation: result.violation };
            })
        );
        for (const result of results) {
            if (result.violation != null) {
                violations.push({
                    ...result.violation,
                    displayRelativeFilepath: result.target.sourceLocation.relativeFilePath,
                    line: result.target.sourceLocation.line,
                    column: result.target.sourceLocation.column
                });
            }
        }
    }

    /**
     * Checks whether a specific generator version exists in the registry.
     */
    private async checkVersionExists({
        target
    }: {
        target: Target;
    }): Promise<{ violation: ValidationViolation | undefined }> {
        if (target.version === "latest") {
            return { violation: undefined };
        }
        const generatorId = getGeneratorIdFromImage({ image: target.image });
        try {
            const fdrOrigin = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
            const client = new GeneratorsClient({ environment: fdrOrigin });
            const response = await client.generators.versions.getGeneratorRelease(generatorId, target.version);
            if (response.ok) {
                return { violation: undefined };
            }
            return {
                violation: {
                    severity: "error",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "version"],
                    message: `Version '${target.version}' does not exist for generator '${target.name}'`
                }
            };
        } catch {
            return {
                violation: {
                    severity: "warning",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "version"],
                    message: `Could not verify version '${target.version}' for generator '${target.name}' (registry unreachable)`
                }
            };
        }
    }

    private countViolations(violations: SdkChecker.ResolvedViolation[]): { errorCount: number; warningCount: number } {
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
            }
        }

        return { errorCount, warningCount };
    }
}
