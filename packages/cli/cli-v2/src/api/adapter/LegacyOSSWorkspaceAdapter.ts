import type { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import type { generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import type { Context } from "../../context/Context.js";
import type { ApiDefinition } from "../config/ApiDefinition.js";
import { isConjureSpec } from "../config/ConjureSpec.js";
import { isFernSpec } from "../config/FernSpec.js";
import { LegacyApiSpecAdapter } from "./LegacyApiSpecAdapter.js";

/**
 * Shared adapter for constructing OSSWorkspace instances from an ApiDefinition.
 */
export class LegacyOSSWorkspaceAdapter {
    private readonly specAdapter: LegacyApiSpecAdapter;

    constructor({ context }: { context: Context }) {
        this.specAdapter = new LegacyApiSpecAdapter({ context });
    }

    /**
     * Builds an OSSWorkspace from OSS specs in an ApiDefinition.
     *
     * Returns undefined if the definition contains no applicable specs
     * (i.e. only Fern or Conjure definitions).
     */
    public build({
        definition,
        absoluteFilePath,
        cliVersion,
        workspaceName,
        generatorsConfiguration
    }: {
        definition: ApiDefinition;
        absoluteFilePath: AbsoluteFilePath;
        cliVersion: string;
        workspaceName?: string;
        generatorsConfiguration?: generatorsYml.GeneratorsConfiguration;
    }): OSSWorkspace | undefined {
        const ossSpecs = definition.specs.filter((spec) => !isFernSpec(spec) && !isConjureSpec(spec));
        if (ossSpecs.length === 0) {
            return undefined;
        }

        const v1Specs = this.specAdapter.convertAll(ossSpecs);

        const filteredSpecs = v1Specs.filter((spec): spec is OpenAPISpec | ProtobufSpec => {
            if (spec.type === "openrpc") {
                return false;
            }
            if (spec.type === "protobuf" && !spec.fromOpenAPI) {
                return false;
            }
            return true;
        });

        const allSpecs = v1Specs.filter((spec: Spec) => {
            if (spec.type === "protobuf" && spec.fromOpenAPI) {
                return false;
            }
            return true;
        });

        if (filteredSpecs.length === 0) {
            return undefined;
        }

        return new OSSWorkspace({
            specs: filteredSpecs,
            allSpecs,
            absoluteFilePath,
            cliVersion,
            generatorsConfiguration,
            workspaceName,
            changelog: undefined
        });
    }
}
