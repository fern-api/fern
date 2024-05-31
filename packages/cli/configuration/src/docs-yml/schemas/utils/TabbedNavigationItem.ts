import { assertNever } from "@fern-api/core-utils";
import { FernDocsConfig } from "../sdk";

export function isTabbedLayoutNavigationItem(
    tabConfig: FernDocsConfig.TabbedNavigationItem
): tabConfig is FernDocsConfig.TabbedLayoutNavigationItem {
    return (tabConfig as FernDocsConfig.TabbedLayoutNavigationItem).layout != null;
}

export function isTabbedLinkNavigationItemV1(
    tabConfig: FernDocsConfig.TabbedNavigationItem
): tabConfig is FernDocsConfig.TabbedLinkNavigationItemV1 {
    return typeof (tabConfig as any).tab === "string" && (tabConfig as any).layout == null;
}

export function isTabbedLinkNavigationItemV2(
    tabConfig: FernDocsConfig.TabbedNavigationItem
): tabConfig is FernDocsConfig.TabbedLinkNavigationItemV2 {
    return (tabConfig as FernDocsConfig.TabbedLinkNavigationItemV2).link != null;
}

export function isTabbedChangelogNavigationItem(
    tabConfig: FernDocsConfig.TabbedNavigationItem
): tabConfig is FernDocsConfig.TabbedChangelogNavigationItem {
    return (tabConfig as FernDocsConfig.TabbedChangelogNavigationItem).changelog != null;
}

interface Visitor<T> {
    layout: (tabbedLayoutNavigationItem: FernDocsConfig.TabbedLayoutNavigationItem) => T;
    linkV1: (tabbedLinkNavigationItem: FernDocsConfig.TabbedLinkNavigationItemV1) => T;
    linkV2: (tabbedLinkNavigationItem: FernDocsConfig.TabbedLinkNavigationItemV2) => T;
    changelog: (tabbedChangelogNavigationItem: FernDocsConfig.TabbedChangelogNavigationItem) => T;
}

export function visitTabbedNavigationItem<T>(tabConfig: FernDocsConfig.TabbedNavigationItem, visitor: Visitor<T>): T {
    if (isTabbedLayoutNavigationItem(tabConfig)) {
        return visitor.layout(tabConfig);
    } else if (isTabbedLinkNavigationItemV1(tabConfig)) {
        return visitor.linkV1(tabConfig);
    } else if (isTabbedLinkNavigationItemV2(tabConfig)) {
        return visitor.linkV2(tabConfig);
    } else if (isTabbedChangelogNavigationItem(tabConfig)) {
        return visitor.changelog(tabConfig);
    } else {
        assertNever(tabConfig);
    }
}
