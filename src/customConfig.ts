import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";

export interface FernOpenapiCustomConfig {
    format: "yaml" | "json";
}

const DEFAULT_FERN_OPENAPI_CUSTOM_CONFIG: FernOpenapiCustomConfig = {
    format: "yaml",
};

export function getCustomConfig(generatorConfig: GeneratorConfig): FernOpenapiCustomConfig {
    if (generatorConfig.customConfig != null) {
        return generatorConfig.customConfig as unknown as FernOpenapiCustomConfig;
    }
    return DEFAULT_FERN_OPENAPI_CUSTOM_CONFIG;
}
