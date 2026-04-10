import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { ValidationIssue } from "@fern-api/yaml-loader";
import type { AiConfig } from "../ai/config/AiConfig.js";
import type { ApiDefinition } from "../api/config/ApiDefinition.js";
import { ApiDefinitionConverter } from "../api/config/converter/ApiDefinitionConverter.js";
import { FernYmlSchemaLoader } from "../config/fern-yml/FernYmlSchemaLoader.js";
import { DocsConfigConverter } from "../docs/config/converter/DocsConfigConverter.js";
import type { DocsConfig } from "../docs/config/DocsConfig.js";
import { SourcedValidationError } from "../errors/SourcedValidationError.js";
import { SdkConfigConverter } from "../sdk/config/converter/SdkConfigConverter.js";
import { SdkConfig } from "../sdk/config/SdkConfig.js";
import { Version } from "../version.js";
import type { Workspace } from "./Workspace.js";

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
 * Loads a complete Fern workspace from fern.yml.
 *
 * Converts API definitions, SDK configuration, and docs configuration
 * from the raw schema into typed domain objects. Relative paths are
 * resolved to absolute paths based on the fern.yml location.
 *
 * SDK-level validation (API references, groups, version checks) is
 * performed separately by SdkChecker.
 */
export class WorkspaceLoader {
    private readonly cwd: AbsoluteFilePath;
    private readonly logger: Logger;
    private readonly issues: ValidationIssue[] = [];

    constructor({ cwd, logger }: { cwd: AbsoluteFilePath; logger: Logger }) {
        this.cwd = cwd;
        this.logger = logger;
    }

    public async loadOrThrow({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): Promise<Workspace> {
        const result = await this.load({ fernYml });
        if (!result.success) {
            throw new SourcedValidationError(result.issues);
        }
        return result.workspace;
    }

    public async load({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): Promise<WorkspaceLoader.Result> {
        const ai = this.convertAi({ fernYml });
        const docs = this.convertDocs({ fernYml });
        const [apis, cliVersion, sdks] = await Promise.all([
            this.convertApis({ fernYml }),
            this.convertCliVersion({ fernYml }),
            this.convertSdks({ fernYml })
        ]);
        if (this.issues.length > 0) {
            return {
                success: false,
                issues: this.issues
            };
        }

        return {
            success: true,
            workspace: {
                absoluteFilePath: fernYml.absoluteFilePath,
                fernYml,
                ai,
                apis,
                cliVersion,
                docs,
                org: fernYml.data.org,
                sdks
            }
        };
    }

    private convertAi({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): AiConfig | undefined {
        const ai = fernYml.data.ai;
        if (ai == null) {
            return undefined;
        }
        return {
            provider: ai.provider,
            model: ai.model
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

    private async convertCliVersion({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): Promise<string> {
        return fernYml.data.cli?.version ?? Version;
    }

    private convertDocs({ fernYml }: { fernYml: FernYmlSchemaLoader.Success }): DocsConfig | undefined {
        const docsConverter = new DocsConfigConverter();
        const docsResult = docsConverter.convert({ fernYml });
        if (!docsResult.success) {
            this.issues.push(...docsResult.issues);
            return undefined;
        }
        return docsResult.config;
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
}
