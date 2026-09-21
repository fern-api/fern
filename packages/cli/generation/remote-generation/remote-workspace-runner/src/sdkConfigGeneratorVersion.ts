export const SDK_CONFIG_UNPINNED_GENERATOR_VERSION = "__fern_sdk_config_unpinned__";

export function isSdkConfigUnpinnedGeneratorVersion(version: string): boolean {
    return version === SDK_CONFIG_UNPINNED_GENERATOR_VERSION;
}

export function resolveSdkConfigGeneratorVersion(generatorVersion: string | undefined): string {
    return generatorVersion ?? SDK_CONFIG_UNPINNED_GENERATOR_VERSION;
}
