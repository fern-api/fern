import { docsYml } from "@fern-api/configuration-loader";
import { kebabCase } from "lodash-es";

import { validateProductConfigFileSchema } from "../../docsAst/validateProductConfig.js";
import { validateVersionConfigFileSchema } from "../../docsAst/validateVersionConfig.js";
import { Rule, RuleViolation } from "../../Rule.js";

export const ValidTabMenuRule: Rule = {
    name: "valid-tab-menu",
    create: ({ workspace }) => {
        return {
            file: async ({ config }) =>
                checkTabMenus({
                    tabs: config.tabs,
                    navigation: config.navigation,
                    hasHeaderTabs: hasHeaderTabs(config)
                }),
            versionFile: async ({ content }) => {
                const parsed = await validateVersionConfigFileSchema({ value: content });
                // Schema errors are reported by validate-version-file.
                return parsed.type === "success"
                    ? checkTabMenus({ ...parsed.contents, hasHeaderTabs: hasHeaderTabs(workspace.config) })
                    : [];
            },
            productFile: async ({ content, product }) => {
                if (product.versions != null && product.versions.length > 0) {
                    return [];
                }
                const parsed = await validateProductConfigFileSchema({ value: content });
                return parsed.type === "success"
                    ? checkTabMenus({ ...parsed.contents, hasHeaderTabs: hasHeaderTabs(workspace.config) })
                    : [];
            }
        };
    }
};

/** Mirrors the parser: `theme.tabs.placement` overrides `layout.tabs-placement`. */
function hasHeaderTabs(config: Pick<docsYml.RawSchemas.DocsConfiguration, "theme" | "layout">): boolean {
    const themeTabs = config.theme?.tabs;
    const themePlacement = themeTabs != null && typeof themeTabs === "object" ? themeTabs.placement : undefined;
    const placement = themePlacement ?? config.layout?.tabsPlacement;
    return placement === "header" && config.layout?.disableHeader !== true;
}

/** Checks the tab menus of one `tabs` + `navigation` pair: docs.yml, a version file or a product file. */
function checkTabMenus({
    tabs: tabsOrUndefined,
    navigation,
    hasHeaderTabs
}: {
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    navigation?: docsYml.RawSchemas.NavigationConfig;
    hasHeaderTabs: boolean;
}): RuleViolation[] {
    const tabs = tabsOrUndefined ?? {};
    const violations: RuleViolation[] = [];

    const menuTabIdsByMember = new Map<string, string[]>();
    for (const [tabId, tab] of Object.entries(tabs)) {
        if (tab.tabMenuColumnHeight != null && tab.tabMenu == null) {
            violations.push({
                severity: "warning",
                message: `Tab "${tabId}" sets tab-menu-column-height, but it has no tab-menu, so the setting has no effect.`
            });
        }
        const memberIdsBySlug = new Map<string, string[]>();
        for (const { member } of docsYml.flattenRawTabMenu(tab.tabMenu ?? [])) {
            menuTabIdsByMember.set(member.tab, [...(menuTabIdsByMember.get(member.tab) ?? []), tabId]);
            if (member.skipSlug !== true) {
                // Same URL piece the resolver gives the member.
                const slug = member.slug ?? kebabCase(member.displayName);
                memberIdsBySlug.set(slug, [...(memberIdsBySlug.get(slug) ?? []), member.tab]);
            }
        }
        for (const [slug, memberIds] of memberIdsBySlug) {
            if (memberIds.length > 1) {
                violations.push({
                    severity: "fatal",
                    message: `Tabs ${memberIds.map((id) => `"${id}"`).join(", ")} in the tab-menu of "${tabId}" all get the URL slug "${slug}". Give each a different display-name or slug.`
                });
            }
        }
    }
    for (const [memberId, menuTabIds] of menuTabIdsByMember) {
        if (tabs[memberId] != null) {
            violations.push({
                severity: "fatal",
                message: `Tab "${memberId}" is in the tab-menu of "${menuTabIds[0]}" and also under tabs. Define it in one place.`
            });
        }
        if (menuTabIds.length > 1) {
            violations.push({
                severity: "fatal",
                message: `Tab "${memberId}" is listed more than once in tab menus (${menuTabIds.map((id) => `"${id}"`).join(", ")}).`
            });
        }
    }

    if (!Array.isArray(navigation)) {
        return violations;
    }
    const navigationItems = navigation.flatMap((item) => ("tab" in item ? [item] : []));
    const navigationTabIds = new Set(navigationItems.map((item) => item.tab));

    for (const item of navigationItems) {
        const tab = tabs[item.tab];
        const menuTabIds = menuTabIdsByMember.get(item.tab);
        if (tab == null && menuTabIds == null) {
            violations.push({
                severity: "fatal",
                message: `Tab "${item.tab}" is in navigation but isn't defined under tabs or in a tab-menu.`
            });
            continue;
        }
        if (tab?.tabMenu != null) {
            if (docsYml.isRawTabWithVariantLayouts(item) || ("layout" in item && item.layout != null)) {
                violations.push({
                    severity: "fatal",
                    message: `Tab "${item.tab}" has a tab-menu, so its navigation entry can't also have a layout or variants. Put pages under each menu tab's own navigation entry.`
                });
            }
            if (!hasHeaderTabs) {
                violations.push({
                    severity: "warning",
                    message: `Tab "${item.tab}" has a tab-menu, but header tabs are off (set \`layout.tabs-placement: header\`). Its tabs will show in a selector at the top of the sidebar instead.`
                });
            }
            continue;
        }
        if (tab == null && menuTabIds != null) {
            const hasLayout = "layout" in item && item.layout != null;
            if (!hasLayout && !docsYml.isRawTabWithVariantLayouts(item)) {
                violations.push({
                    severity: "fatal",
                    message: `Tab "${item.tab}" is in the tab-menu of "${menuTabIds[0]}", so its navigation entry needs a layout or variants.`
                });
            }
        }
    }

    for (const [memberId, menuTabIds] of menuTabIdsByMember) {
        const [menuTabId] = menuTabIds;
        if (tabs[memberId] != null || menuTabId == null || !navigationTabIds.has(menuTabId)) {
            continue;
        }
        if (!navigationTabIds.has(memberId)) {
            violations.push({
                severity: "fatal",
                message: `Tab "${memberId}" is in the tab-menu of "${menuTabId}" but has no entry in navigation. Add \`- tab: ${memberId}\` with a layout or variants.`
            });
        }
    }
    for (const [memberId, menuTabIds] of menuTabIdsByMember) {
        const [menuTabId] = menuTabIds;
        if (menuTabId != null && navigationTabIds.has(memberId) && !navigationTabIds.has(menuTabId)) {
            violations.push({
                severity: "fatal",
                message: `Tab "${memberId}" is in navigation, but its menu tab "${menuTabId}" isn't. Add \`- tab: ${menuTabId}\` where the menu should sit in the header.`
            });
        }
    }
    return violations;
}
