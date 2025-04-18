import { Rule } from "../../Rule";

export const OnlyVersionedNavigation: Rule = {
    name: "only-versioned-navigation",
    create: () => {
        return {
            file: async ({ config }) => {
                if (config.navigation != null && config.versions != null) {
                    return [
                        {
                            severity: "fatal",
                            message:
                                "Cannot contain both navigation and versions. If you want versioned docs, use versions. Otherwise use navigation."
                        }
                    ];
                }
                return [];
            }
        };
    }
};
