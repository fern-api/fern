import { GeneratorConfig } from "@fern-api/base-generator";

export interface FernOpenapiCustomConfig {
    format: "yaml" | "json";
    customOverrides: Record<string, unknown>;
    filename?: string;
}

const DEFAULT_FERN_OPENAPI_CUSTOM_CONFIG: FernOpenapiCustomConfig = {
    format: "yaml",
    customOverrides: {},
    filename: "openapi.yml"
};

export function getCustomConfig(generatorConfig: GeneratorConfig): FernOpenapiCustomConfig {
    if (generatorConfig.customConfig != null) {
        return generatorConfig.customConfig as unknown as FernOpenapiCustomConfig;
    }
    return DEFAULT_FERN_OPENAPI_CUSTOM_CONFIG;
}
