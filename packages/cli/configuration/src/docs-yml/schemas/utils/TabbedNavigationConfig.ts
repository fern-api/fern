import { FernDocsConfig } from "..";

export function isTabbedNavigationConfig(
    navigationConfig: FernDocsConfig.NavigationConfig
): navigationConfig is FernDocsConfig.TabbedNavigationConfig {
    return (
        Array.isArray(navigationConfig) &&
        navigationConfig.length > 0 &&
        navigationConfig.some((config) => (typeof (config as FernDocsConfig.TabbedLayoutNavigationItem).tab === "string"))
    );
}
