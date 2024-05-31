import { assertNever } from "@fern-api/core-utils";
import { FernDocsConfig } from "../sdk";

export function isTabSectionConfig(tabConfig: FernDocsConfig.TabConfig): tabConfig is FernDocsConfig.TabSectionConfig {
    return (tabConfig as any).href == null;
}

export function isTabLinkConfig(tabConfig: FernDocsConfig.TabConfig): tabConfig is FernDocsConfig.TabLinkConfig {
    return (tabConfig as any).href != null;
}

interface Visitor<T> {
    tabSectionConfig: (tabSectionConfig: FernDocsConfig.TabSectionConfig) => T;
    tabLinkConfig: (tabLinkConfig: FernDocsConfig.TabLinkConfig) => T;
}

export function visitTabConfig<T>(tabConfig: FernDocsConfig.TabConfig, visitor: Visitor<T>): T {
    if (isTabSectionConfig(tabConfig)) {
        return visitor.tabSectionConfig(tabConfig);
    } else if (isTabLinkConfig(tabConfig)) {
        return visitor.tabLinkConfig(tabConfig);
    } else {
        assertNever(tabConfig);
    }
}
