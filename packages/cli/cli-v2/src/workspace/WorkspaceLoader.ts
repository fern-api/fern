import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { isNullish, SourceLocation } from "@fern-api/source";
import { ValidationIssue } from "@fern-api/yaml-loader";
import type { ApiDefinition } from "../api/config/ApiDefinition";
import { ApiDefinitionConverter } from "../api/converter/ApiDefinitionConverter";
import { FernYmlSchemaLoader } from "../config/fern-yml/FernYmlSchemaLoader";
import { SdkConfig } from "../sdk/config/SdkConfig";
import { SdkConfigConverter } from "../sdk/converter/SdkConfigConverter";
import type { Workspace } from "./Workspace";

export namespace WorkspaceLoader {
    export type Result = Success | Failure;

    export interface Success {
        success: true;
        workspace: Workspace;
    }

    export interface Failure {
        success: false;
        issues: ValidationIssue[];
    }
}

/**
 * Loads and validates a complete Fern workspace from fern.yml.
 *
 * The WorkspaceLoader consolidates:
 *  - API definition conversion
 *  - SDK configuration conversion
 *  - Docs configuration conversion
 *
 * All relative paths in the configuration are resolved to absolute paths
 * based on the fern.yml location, and validated for existence.
 */
export class WorkspaceLoader {
    private readonly cwd: AbsoluteFilePath;
    private readonly logger: Logger;
    private readonly issues: ValidationIssue[] = [];

    constructor({ cwd, logger }: { cwd: AbsoluteFilePath; logger: Logger }) {
        this.cwd = cwd;
        this.logger = logger;
    }

    public async load({ fernYml }: { fernYml: FernYmlSchemaLoader.Result }): Promise<WorkspaceLoader.Result> {
        if (!fernYml.success) {
            return {
                success: false,
                issues: fernYml.issues
            };
        }

        const apis = await this.convertApis({ fernYml });
        const sdks = await this.convertSdks({ fernYml });
        if (this.issues.length > 0) {
            return {
                success: false,
                issues: this.issues
            };
        }

        const workspace: Workspace = {
            apis,
            sdks
        };

        await this.validateWorkspace({ fernYml, workspace });
        if (this.issues.length > 0) {
            return {
                success: false,
                issues: this.issues
            };
        }

        return {
            success: true,
            workspace
        };
    }

    private async convertApis({
        fernYml
    }: {
        fernYml: FernYmlSchemaLoader.Success;
    }): Promise<Record<string, ApiDefinition>> {
        const apiConverter = new ApiDefinitionConverter({ cwd: this.cwd });
        const apiResult = await apiConverter.convert({ fernYml });
        if (!apiResult.success) {
            this.issues.push(...apiResult.issues);
            return {};
        }
        return apiResult.apis;
    }

    private async convertSdks({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): Promise<SdkConfig | undefined> {
        const sdkConverter = new SdkConfigConverter({ logger: this.logger });
        const sdkResult = sdkConverter.convert({ fernYml });
        if (!sdkResult.success) {
            this.issues.push(...sdkResult.issues);
            return undefined;
        }
        return sdkResult.config;
    }

    private async validateWorkspace({
        fernYml,
        workspace
    }: {
        fernYml: FernYmlSchemaLoader.Success;
        workspace: Workspace;
    }): Promise<void> {
        await this.validateSdks({ fernYml, workspace });
    }

    private async validateSdks({
        fernYml,
        workspace
    }: {
        fernYml: FernYmlSchemaLoader.Success;
        workspace: Workspace;
    }): Promise<void> {
        if (workspace.sdks != null && Object.keys(workspace.apis).length === 0) {
            this.issues.push(
                new ValidationIssue({
                    message:
                        "SDKs require at least one API defined in fern.yml; please define an API with the 'api' key",
                    location: fernYml.sourced.$loc
                })
            );
        }
        if (Object.keys(workspace.apis).length >= 1) {
            // If we have one or more APIs, we need to validate that each target references an existing API.
            for (const target of workspace.sdks?.targets ?? []) {
                if (!workspace.apis[target.api]) {
                    this.issues.push(
                        new ValidationIssue({
                            message: `API '${target.api}' is not defined`,
                            location: this.getTargetSourceLocation({ fernYml, targetName: target.name })
                        })
                    );
                }
            }
        }
        const defaultGroup = workspace.sdks?.defaultGroup;
        if (defaultGroup != null) {
            // If a default group is specified, at least one target must specify that group.
            if (!this.defaultGroupExists({ workspace, defaultGroup })) {
                this.issues.push(
                    new ValidationIssue({
                        message: `Default group '${defaultGroup}' is not referenced by any target`,
                        location: fernYml.sourced.$loc
                    })
                );
            }
        }
    }

    private defaultGroupExists({ workspace, defaultGroup }: { workspace: Workspace; defaultGroup: string }): boolean {
        return workspace.sdks?.targets?.some((target) => target.groups?.includes(defaultGroup)) ?? false;
    }

    private getTargetSourceLocation({
        fernYml,
        targetName
    }: {
        fernYml: FernYmlSchemaLoader.Success;
        targetName: string;
    }): SourceLocation {
        const sourcedSdks = fernYml.sourced.sdks;
        if (isNullish(sourcedSdks)) {
            return fernYml.sourced.$loc;
        }
        const sourcedTargets = sourcedSdks.targets;
        if (isNullish(sourcedTargets)) {
            return fernYml.sourced.$loc;
        }
        return sourcedTargets[targetName]?.$loc ?? fernYml.sourced.$loc;
    }
}
