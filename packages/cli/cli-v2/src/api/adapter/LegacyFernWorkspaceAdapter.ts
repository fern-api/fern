import type { FernWorkspace } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, dirname, relativize } from "@fern-api/fs-utils";
import { ConjureWorkspace, LazyFernWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Task } from "../../ui/Task.js";
import type { ApiDefinition } from "../config/ApiDefinition.js";
import type { ConjureSpec } from "../config/ConjureSpec.js";
import { isConjureSpec } from "../config/ConjureSpec.js";
import type { FernSpec } from "../config/FernSpec.js";
import { isFernSpec } from "../config/FernSpec.js";
import { LegacyOSSWorkspaceAdapter } from "./LegacyOSSWorkspaceAdapter.js";

export namespace LegacyFernWorkspaceAdapter {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;

        /** The current task */
        task: Task;
    }
}

/**
 * Adapts ApiDefinition types to legacy FernWorkspace instances.
 */
export class LegacyFernWorkspaceAdapter {
    private readonly context: Context;
    private readonly taskContext: TaskContextAdapter;
    private readonly cliVersion: string;

    constructor(config: LegacyFernWorkspaceAdapter.Config) {
        this.context = config.context;
        this.taskContext = new TaskContextAdapter({ context: this.context, task: config.task });
        this.cliVersion = config.cliVersion;
    }

    /**
     * Adapt an ApiDefinition into a FernWorkspace.
     *
     * Supports three mutually exclusive modes:
     *  - Fern definition: Uses LazyFernWorkspace
     *  - Conjure definition: Uses ConjureWorkspace
     *  - OpenAPI/AsyncAPI/Protobuf/OpenRPC: Uses OSSWorkspace (can be mixed together)
     *
     * Note: Spec combination validation is performed earlier in ApiDefinitionConverter.
     */
    async adapt(definition: ApiDefinition): Promise<FernWorkspace> {
        const fernSpec = definition.specs.find(isFernSpec);
        if (fernSpec != null) {
            return this.adaptFernSpec(fernSpec);
        }
        const conjureSpec = definition.specs.find(isConjureSpec);
        if (conjureSpec != null) {
            return this.adaptConjureSpec(conjureSpec);
        }
        return this.adaptOssSpecs(definition);
    }

    private async adaptFernSpec(spec: FernSpec): Promise<FernWorkspace> {
        // LazyFernWorkspace expects the workspace root directory (parent of the definition directory).
        //
        // The configured FernSpec path points to the definition directory itself (where api.yml lives),
        // so we get the parent directory to use as the workspace root.
        const workspaceRoot = dirname(spec.fern);
        const lazyWorkspace = new LazyFernWorkspace({
            absoluteFilePath: workspaceRoot,
            context: this.taskContext,
            cliVersion: this.cliVersion,
            generatorsConfiguration: undefined,
            workspaceName: undefined,
            changelog: undefined
        });
        return lazyWorkspace.toFernWorkspace({ context: this.taskContext });
    }

    private async adaptConjureSpec(spec: ConjureSpec): Promise<FernWorkspace> {
        const conjureWorkspace = new ConjureWorkspace({
            absoluteFilePath: this.context.cwd,
            relativePathToConjureDirectory: relativize(this.context.cwd, spec.conjure),
            context: this.taskContext,
            cliVersion: this.cliVersion,
            generatorsConfiguration: undefined,
            workspaceName: undefined,
            changelog: undefined
        });
        return conjureWorkspace.toFernWorkspace({ context: this.taskContext });
    }

    private async adaptOssSpecs(definition: ApiDefinition): Promise<FernWorkspace> {
        const apiConfig = this.buildApiConfiguration(definition);
        const ossAdapter = new LegacyOSSWorkspaceAdapter({ context: this.context });
        const ossWorkspace = ossAdapter.build({
            definition,
            cliVersion: this.cliVersion,
            absoluteFilePath: this.context.cwd,
            generatorsConfiguration: apiConfig != null ? this.buildGeneratorsConfiguration(apiConfig) : undefined
        });

        if (ossWorkspace == null) {
            throw new Error("Internal error; failed to build API definitions");
        }

        return ossWorkspace.toFernWorkspace({ context: this.taskContext });
    }

    private buildApiConfiguration(definition: ApiDefinition): generatorsYml.SingleNamespaceAPIDefinition | undefined {
        if (
            definition.auth == null &&
            definition.authSchemes == null &&
            definition.environments == null &&
            definition.headers == null &&
            definition.defaultUrl == null &&
            definition.defaultEnvironment == null
        ) {
            return undefined;
        }
        return {
            type: "singleNamespace",
            definitions: [],
            auth: definition.auth as RawSchemas.ApiAuthSchema | undefined,
            "auth-schemes": definition.authSchemes as
                | Record<RawSchemas.AuthSchemeKey, RawSchemas.AuthSchemeDeclarationSchema>
                | undefined,
            "default-url": definition.defaultUrl,
            "default-environment": definition.defaultEnvironment,
            environments: definition.environments as Record<string, RawSchemas.EnvironmentSchema> | undefined,
            headers: definition.headers as Record<string, RawSchemas.HttpHeaderSchema> | undefined
        };
    }

    private buildGeneratorsConfiguration(
        apiConfig: generatorsYml.SingleNamespaceAPIDefinition
    ): generatorsYml.GeneratorsConfiguration {
        return {
            absolutePathToConfiguration: AbsoluteFilePath.of(this.context.cwd),
            api: apiConfig,
            defaultGroup: undefined,
            groupAliases: {},
            reviewers: undefined,
            groups: [],
            whitelabel: undefined,
            ai: undefined,
            replay: undefined,
            rawConfiguration: {}
        };
    }
}
