import type { FernWorkspace, OpenAPISpec, ProtobufSpec } from "@fern-api/api-workspace-commons";
import { dirname, relativize } from "@fern-api/fs-utils";
import { ConjureWorkspace, LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter";
import type { Context } from "../../context/Context";
import type { Task } from "../../ui/Task";
import type { ApiDefinition } from "../config/ApiDefinition";
import type { ApiSpec } from "../config/ApiSpec";
import type { ConjureSpec } from "../config/ConjureSpec";
import { isConjureSpec } from "../config/ConjureSpec";
import type { FernSpec } from "../config/FernSpec";
import { isFernSpec } from "../config/FernSpec";
import { LegacyApiSpecAdapter } from "./LegacyApiSpecAdapter";

export namespace LegacyFernWorkspaceAdapter {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;

        /** Task for log display */
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
     *  - OpenAPI/AsyncAPI/Protobuf: Uses OSSWorkspace (can be mixed together)
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
        return this.adaptOssSpecs(definition.specs);
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

    private async adaptOssSpecs(specs: ApiSpec[]): Promise<FernWorkspace> {
        // Filter out Fern and Conjure specs (handled separately).
        const ossSpecs = specs.filter((spec) => !isFernSpec(spec) && !isConjureSpec(spec));

        const specAdapter = new LegacyApiSpecAdapter({ context: this.context });
        const v1Specs = specAdapter.convertAll(ossSpecs);

        const filteredSpecs = v1Specs.filter((spec): spec is OpenAPISpec | ProtobufSpec => {
            if (spec.type === "openrpc") {
                return false;
            }
            if (spec.type === "protobuf" && !spec.fromOpenAPI) {
                return false;
            }
            return true;
        });

        const allSpecs = v1Specs.filter((spec) => {
            if (spec.type === "protobuf" && spec.fromOpenAPI) {
                return false;
            }
            return true;
        });

        const ossWorkspace = new OSSWorkspace({
            specs: filteredSpecs,
            allSpecs,
            absoluteFilePath: this.context.cwd,
            cliVersion: this.cliVersion,
            workspaceName: undefined,
            generatorsConfiguration: undefined,
            changelog: undefined
        });

        return ossWorkspace.toFernWorkspace({ context: this.taskContext });
    }
}
