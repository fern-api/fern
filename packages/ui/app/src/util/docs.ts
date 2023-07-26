import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export function isUnversionedNavigationConfig(
    config: FernRegistryDocsRead.NavigationConfig
): config is FernRegistryDocsRead.UnversionedNavigationConfig {
    return Array.isArray((config as FernRegistryDocsRead.UnversionedNavigationConfig).items);
}

export function isVersionedNavigationConfig(
    config: FernRegistryDocsRead.NavigationConfig
): config is FernRegistryDocsRead.VersionedNavigationConfig {
    return Array.isArray((config as FernRegistryDocsRead.VersionedNavigationConfig).versions);
}

export function assertIsVersionedNavigationConfig(
    config: FernRegistryDocsRead.NavigationConfig
): asserts config is FernRegistryDocsRead.VersionedNavigationConfig {
    if (!isVersionedNavigationConfig(config)) {
        throw new Error("Invalid navigation config. Expected versioned.");
    }
}

export function assertIsUnversionedNavigationConfig(
    config: FernRegistryDocsRead.NavigationConfig
): asserts config is FernRegistryDocsRead.UnversionedNavigationConfig {
    if (!isUnversionedNavigationConfig(config)) {
        throw new Error("Invalid navigation config. Expected unversioned.");
    }
}
