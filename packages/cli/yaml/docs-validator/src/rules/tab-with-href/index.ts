import { docsYml } from "@fern-api/configuration-loader";

import { Rule, RuleViolation } from "../../Rule";

export const TabWithHrefRule: Rule = {
    name: "tab-with-href",
    create: () => {
        return {
            file: async ({ config }) => {
                const tabs = config.tabs ?? {};

                if (config.navigation == null) {
                    return [];
                }

                const ruleViolations: RuleViolation[] = [];

                if (isTabbedNavigationConfig(config.navigation)) {
                    for (const tabItem of config.navigation) {
                        const tabConfig = tabs[tabItem.tab];
                        if (tabConfig == null) {
                            ruleViolations.push({
                                severity: "fatal",
                                message: `Tab "${tabItem.tab}" is missing from the tabs configuration.`
                            });
                            continue;
                        }

                        const hasLayout = tabbedNavigationItemHasLayout(tabItem);
                        const hasVariants = tabbedNavigationItemHasVariants(tabItem);

                        if (tabConfig.href != null && (hasLayout || hasVariants)) {
                            ruleViolations.push({
                                severity: "fatal",
                                message: `Tab "${tabItem.tab}" has both a href and ${hasLayout ? "layout" : "variants"}. Only one should be used.`
                            });
                            continue;
                        }

                        if (tabConfig.href == null && !hasLayout && !hasVariants) {
                            ruleViolations.push({
                                severity: "fatal",
                                message: `Tab "${tabItem.tab}" is missing a href, layout, or variants.`
                            });
                            continue;
                        }
                    }
                }

                return [];
            }
        };
    }
};

function isTabbedNavigationConfig(
    navigationConfig: docsYml.RawSchemas.NavigationConfig
): navigationConfig is docsYml.RawSchemas.TabbedNavigationConfig {
    return (
        Array.isArray(navigationConfig) &&
        navigationConfig.length > 0 &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (navigationConfig[0] as docsYml.RawSchemas.TabbedNavigationItem).tab != null
    );
}

function tabbedNavigationItemHasLayout(
    item: docsYml.RawSchemas.TabbedNavigationItem
): item is docsYml.RawSchemas.TabbedNavigationItemWithLayout & {
    layout: docsYml.RawSchemas.NavigationItem[];
} {
    return "layout" in item && Array.isArray(item.layout);
}

function tabbedNavigationItemHasVariants(
    item: docsYml.RawSchemas.TabbedNavigationItem
): item is docsYml.RawSchemas.TabbedNavigationItemWithVariants & {
    variants: docsYml.RawSchemas.TabVariant[];
} {
    return "variants" in item && Array.isArray(item.variants);
}
