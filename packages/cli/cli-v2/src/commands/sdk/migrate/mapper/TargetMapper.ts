import {
    type FernConfigMappingDiagnostic,
    type FernResolvedGeneratorInput,
    type SdkConfigV1OutputConfig
} from "@postman/sdk-config/sdk-config/v1";
import type { Context } from "../../../../context/Context.js";
import { LegacyGeneratorInvocationAdapter } from "../../../../sdk/adapter/LegacyGeneratorInvocationAdapter.js";
import type { Target } from "../../../../sdk/config/Target.js";
import { PublicationMapper } from "./PublicationMapper.js";

export declare namespace TargetMapper {
    export interface Args {
        index: number;
        target: Target;
    }

    export interface Config {
        context: Context;
    }

    export interface Result {
        diagnostics: FernConfigMappingDiagnostic[];
        generator: FernResolvedGeneratorInput;
    }
}

/** Maps a resolved Fern SDK target to the external mapper's generator input. */
export class TargetMapper {
    private readonly invocationAdapter: LegacyGeneratorInvocationAdapter;
    private readonly publicationMapper = new PublicationMapper();

    constructor({ context }: TargetMapper.Config) {
        this.invocationAdapter = new LegacyGeneratorInvocationAdapter({ context });
    }

    public async map({ index, target }: TargetMapper.Args): Promise<TargetMapper.Result> {
        const normalizedTarget = this.publicationMapper.normalizeTarget(target);
        const invocation = await this.invocationAdapter.adapt(normalizedTarget);
        // Git delivery and its publishInfo are already represented by invocation.outputMode.
        const publication =
            normalizedTarget.output.git == null
                ? this.publicationMapper.map({ target: normalizedTarget, index })
                : { diagnostics: [] };
        // Registry package identity is more specific than general target metadata.
        const packageConfig = { ...normalizedTarget.metadata, ...publication.package };
        const output: SdkConfigV1OutputConfig | undefined =
            normalizedTarget.output.git != null
                ? undefined
                : normalizedTarget.output.path != null
                  ? {
                        delivery: "files",
                        path: normalizedTarget.output.path,
                        ...(publication.publish == null ? {} : { publish: publication.publish })
                    }
                  : publication.publish == null
                    ? undefined
                    : { delivery: "zip", publish: publication.publish };
        return {
            diagnostics: publication.diagnostics,
            generator: {
                ...invocation,
                sdkLanguage: normalizedTarget.lang,
                readme: normalizedTarget.readme,
                ...(Object.keys(packageConfig).length > 0 ? { package: packageConfig } : {}),
                ...(output == null ? {} : { output })
            }
        };
    }
}
