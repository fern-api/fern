import { type ValidationViolation } from "@fern-api/fern-definition-validator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";
import chalk from "chalk";
import type { FernYmlSchemaLoader } from "../../config/fern-yml/FernYmlSchemaLoader.js";
import type { Context } from "../../context/Context.js";
import { Colors, Icons } from "../../ui/format.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { getGeneratorIdFromImage } from "../config/converter/getGeneratorIdFromImage.js";
import type { SdkConfig } from "../config/SdkConfig.js";
import type { Target } from "../config/Target.js";

export declare namespace SdkChecker {
    export type VersionChecker = (args: { target: Target }) => Promise<{ violation: ValidationViolation | undefined }>;

    export interface Config {
        /** The CLI context */
        context: Context;

        /** Output stream for writing results (defaults to process.stderr) */
        stream?: NodeJS.WriteStream;

        /** Override version checking (defaults to registry lookup). Useful for testing. */
        versionChecker?: VersionChecker;
    }

    export interface Result {
        /** Total error count */
        errorCount: number;

        /** Total warning count */
        warningCount: number;

        /** Time taken in milliseconds */
        elapsedMillis: number;
    }
}

export class SdkChecker {
    private readonly stream: NodeJS.WriteStream;
    private readonly versionChecker: SdkChecker.VersionChecker;

    constructor(config: SdkChecker.Config) {
        this.stream = config.stream ?? process.stderr;
        this.versionChecker = config.versionChecker ?? ((args) => this.checkVersionExists(args));
    }

    /**
     * Check SDK configuration in the workspace and display results.
     */
    public async check({
        workspace,
        fernYml
    }: {
        workspace: Workspace;
        fernYml: FernYmlSchemaLoader.Success;
    }): Promise<SdkChecker.Result> {
        const startTime = performance.now();
        const violations: ValidationViolation[] = [];

        if (workspace.sdks == null) {
            return {
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
        await this.validateVersions({ sdks, violations });

        if (violations.length > 0) {
            this.displayViolations(violations);
        }

        return {
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
        violations: ValidationViolation[];
    }): void {
        if (Object.keys(workspace.apis).length === 0) {
            violations.push({
                severity: "error",
                relativeFilepath: fernYmlRelativePath,
                nodePath: ["sdks"],
                message: "SDKs are configured but no APIs are defined"
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
        violations: ValidationViolation[];
    }): void {
        for (const target of sdks.targets) {
            if (workspace.apis[target.api] == null) {
                violations.push({
                    severity: "error",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "api"],
                    message: `API '${target.api}' is not defined`
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
        violations: ValidationViolation[];
    }): void {
        const defaultGroup = sdks.defaultGroup;
        if (defaultGroup == null) {
            return;
        }
        const isReferenced = sdks.targets.some(
            (target) => target.groups != null && target.groups.includes(defaultGroup)
        );
        if (!isReferenced) {
            violations.push({
                severity: "error",
                relativeFilepath: fernYmlRelativePath,
                nodePath: ["sdks", "defaultGroup"],
                message: `Default group '${defaultGroup}' is not referenced by any target`
            });
        }
    }

    /**
     * Checks if a target has an empty version string.
     */
    private validateEmptyVersions({ sdks, violations }: { sdks: SdkConfig; violations: ValidationViolation[] }): void {
        for (const target of sdks.targets) {
            if (target.version.length === 0) {
                violations.push({
                    severity: "error",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "version"],
                    message: "Version must not be empty"
                });
            }
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
        violations: ValidationViolation[];
    }): Promise<void> {
        const results = await Promise.all(sdks.targets.map((target) => this.versionChecker({ target })));
        for (const result of results) {
            if (result.violation != null) {
                violations.push(result.violation);
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

    /**
     * Writes each violation to the output stream.
     */
    private displayViolations(violations: ValidationViolation[]): void {
        for (const violation of violations) {
            const { icon, colorFn } = this.getSeverityStyle(violation.severity);
            const filepath = chalk.dim(String(violation.relativeFilepath));
            this.stream.write(`  ${icon} ${filepath}  ${colorFn(violation.message)}\n`);
        }
        this.stream.write("\n");
    }

    private getSeverityStyle(severity: ValidationViolation["severity"]): {
        icon: string;
        colorFn: (text: string) => string;
    } {
        switch (severity) {
            case "fatal":
            case "error":
                return { icon: Icons.error, colorFn: Colors.error };
            case "warning":
                return { icon: Icons.warning, colorFn: Colors.warning };
        }
    }

    private countViolations(violations: ValidationViolation[]): { errorCount: number; warningCount: number } {
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
