import { docsYml } from "@fern-api/configuration-loader";

import { Rule, RuleViolation } from "../../Rule.js";

export const ValidDropdownRule: Rule = {
    name: "valid-dropdown",
    create: () => {
        return {
            file: async ({ config }) => {
                if (!Array.isArray(config.navigation)) {
                    return [];
                }
                const hasHeaderTabs = config.layout?.tabsPlacement === "header" && config.layout.disableHeader !== true;
                const violations: RuleViolation[] = [];
                const dropdownTabIds = new Set(
                    config.navigation.flatMap((item) =>
                        "tab" in item && docsYml.isRawTabWithDropdown(item) ? [item.tab] : []
                    )
                );
                for (const [tabId, tab] of Object.entries(config.tabs ?? {})) {
                    if (tab.dropdownColumnHeight != null && !dropdownTabIds.has(tabId)) {
                        violations.push({
                            severity: "warning",
                            message: `Tab "${tabId}" sets dropdown-column-height, but it has no dropdown in navigation, so the setting has no effect.`
                        });
                    }
                }
                for (const item of config.navigation) {
                    if (!("tab" in item) || !docsYml.isRawTabWithDropdown(item)) {
                        continue;
                    }
                    if ("variants" in item || "layout" in item) {
                        violations.push({
                            severity: "fatal",
                            message: `Tab "${item.tab}" has a dropdown, so it can't also have its own variants or layout.`
                        });
                    }
                    if (!hasHeaderTabs) {
                        violations.push({
                            severity: "warning",
                            message: `Tab "${item.tab}" has a dropdown, but header tabs are off (set \`layout.tabs-placement: header\`). Its items will show in a selector at the top of the sidebar instead.`
                        });
                    }
                    for (const { item: dropdownItem } of docsYml.flattenRawDropdownItems(item.dropdown)) {
                        const hasLayout = dropdownItem.layout != null;
                        const hasVariants = dropdownItem.variants != null;
                        if (hasLayout === hasVariants) {
                            violations.push({
                                severity: "fatal",
                                message: `Dropdown item "${dropdownItem.title}" in tab "${item.tab}" needs exactly one of layout or variants.`
                            });
                        }
                    }
                }
                return violations;
            }
        };
    }
};
