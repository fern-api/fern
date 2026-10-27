import { docsYml } from "@fern-api/configuration-loader";

import { Rule, RuleViolation } from "../../Rule.js";

export const ValidTabMenuRule: Rule = {
    name: "valid-tab-menu",
    create: () => {
        return {
            file: async ({ config }) => {
                const tabs = config.tabs ?? {};
                const violations: RuleViolation[] = [];

                const menuTabIdsByMember = new Map<string, string[]>();
                for (const [tabId, tab] of Object.entries(tabs)) {
                    if (tab.tabMenuColumnHeight != null && tab.tabMenu == null) {
                        violations.push({
                            severity: "warning",
                            message: `Tab "${tabId}" sets tab-menu-column-height, but it has no tab-menu, so the setting has no effect.`
                        });
                    }
                    for (const { member } of docsYml.flattenRawTabMenu(tab.tabMenu ?? [])) {
                        menuTabIdsByMember.set(member.tab, [...(menuTabIdsByMember.get(member.tab) ?? []), tabId]);
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

                if (!Array.isArray(config.navigation)) {
                    return violations;
                }
                const navigationItems = config.navigation.flatMap((item) => ("tab" in item ? [item] : []));
                const navigationTabIds = new Set(navigationItems.map((item) => item.tab));
                const hasHeaderTabs = config.layout?.tabsPlacement === "header" && config.layout.disableHeader !== true;

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
        };
    }
};
