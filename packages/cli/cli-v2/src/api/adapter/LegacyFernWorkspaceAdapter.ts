import type { FernWorkspace, OpenAPISpec, ProtobufSpec } from "@fern-api/api-workspace-commons";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter";
import type { Context } from "../../context/Context";
import type { ApiDefinition } from "../config/ApiDefinition";
import { LegacyApiSpecAdapter } from "./LegacyApiSpecAdapter";

export namespace LegacyFernWorkspaceAdapter {
    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;
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
        this.taskContext = new TaskContextAdapter({ context: this.context });
        this.cliVersion = config.cliVersion;
    }

    /**
     * Adapt an ApiDefinition into a FernWorkspace.
     *
     * Convert ApiSpecs to legacy Specs and filter them appropriately for OSSWorkspace,
     * before returning a fully initialized FernWorkspace.
     */
    async adapt(definition: ApiDefinition): Promise<FernWorkspace> {
        const specAdapter = new LegacyApiSpecAdapter({ context: this.context });

        const v1Specs = specAdapter.convertAll(definition.specs);
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
