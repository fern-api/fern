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
                                severity: "error",
                                message: `Tab "${tabItem.tab}" is missing from the tabs configuration.`
                            });
                            continue;
                        }

                        if (tabConfig.href != null && tabItem.layout != null) {
                            ruleViolations.push({
                                severity: "error",
                                message: `Tab "${tabItem.tab}" has both a href and layout. Only one should be used.`
                            });
                            continue;
                        }

                        if (tabConfig.href == null && tabItem.layout == null) {
                            ruleViolations.push({
                                severity: "error",
                                message: `Tab "${tabItem.tab}" is missing a href or layout.`
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
