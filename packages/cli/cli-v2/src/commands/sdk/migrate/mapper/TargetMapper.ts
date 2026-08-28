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
        const invocation = await this.invocationAdapter.adapt(target);
        const publication =
            target.output.git == null ? this.publicationMapper.map({ target, index }) : { diagnostics: [] };
        const packageConfig = { ...target.metadata, ...publication.package };
        const output: SdkConfigV1OutputConfig | undefined =
            target.output.git != null
                ? undefined
                : target.output.path != null
                  ? {
                        delivery: "files",
                        path: target.output.path,
                        ...(publication.publish == null ? {} : { publish: publication.publish })
                    }
                  : publication.publish == null
                    ? undefined
                    : { delivery: "zip", publish: publication.publish };
        return {
            diagnostics: publication.diagnostics,
            generator: {
                ...invocation,
                sdkLanguage: target.lang,
                readme: target.readme,
                ...(Object.keys(packageConfig).length > 0 ? { package: packageConfig } : {}),
                ...(output == null ? {} : { output })
            }
        };
    }
}
