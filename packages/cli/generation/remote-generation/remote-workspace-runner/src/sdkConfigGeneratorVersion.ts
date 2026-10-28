import type { GenerationConfigRoute } from "./sdk-gen-client/index.js";

export const FERN_GENERATOR_LATEST_VERSION = "latest";
export const SDK_CONFIG_UNPINNED_GENERATOR_VERSION = "__fern_sdk_config_unpinned__";

export function isSdkConfigUnpinnedGeneratorVersion(version: string): boolean {
    return version === SDK_CONFIG_UNPINNED_GENERATOR_VERSION;
}

export function resolveSdkConfigGeneratorVersion(generatorVersion: string | undefined): string {
    return generatorVersion ?? SDK_CONFIG_UNPINNED_GENERATOR_VERSION;
}

export function isGeneratorVersionForUnpinnedRoute(route: GenerationConfigRoute, version: string): boolean {
    if (route.requestedVersion != null) {
        return false;
    }
    return route.versionSource === "fern-latest"
        ? version === FERN_GENERATOR_LATEST_VERSION
        : isSdkConfigUnpinnedGeneratorVersion(version);
}
