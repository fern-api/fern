import {
    isTabbedNavigationConfig,
    isTabLinkConfig,
    visitTabbedNavigationItem
} from "@fern-api/configuration/src/docs-yml/schemas/utils";
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
                        visitTabbedNavigationItem(tabItem, {
                            layout: (layout) => {
                                const tabConfig = tabs[layout.tab];
                                if (tabConfig == null) {
                                    ruleViolations.push({
                                        severity: "error",
                                        message: `Tab "${layout.tab}" is missing from the tabs configuration.`
                                    });
                                } else if (isTabLinkConfig(tabConfig)) {
                                    ruleViolations.push({
                                        severity: "error",
                                        message: `Tab "${layout.tab}" is a link and cannot contain a layout.`
                                    });
                                }
                            },
                            linkV1: (link) => {
                                const tabConfig = tabs[link.tab];

                                if (tabConfig == null) {
                                    ruleViolations.push({
                                        severity: "error",
                                        message: `Tab "${link.tab}" is missing from the tabs configuration.`
                                    });
                                } else if (!isTabLinkConfig(tabConfig)) {
                                    ruleViolations.push({
                                        severity: "error",
                                        message: `Tab "${link.tab}" is expected to contain a href.`
                                    });
                                }
                            },
                            linkV2: () => {
                                // Do nothing
                            }
                        });
                    }
                }

                return [];
            }
        };
    }
};
