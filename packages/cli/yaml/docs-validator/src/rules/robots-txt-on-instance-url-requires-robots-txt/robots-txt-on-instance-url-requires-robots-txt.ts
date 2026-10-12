import { Rule } from "../../Rule.js";

export const RobotsTxtOnInstanceUrlRequiresRobotsTxtRule: Rule = {
    name: "robots-txt-on-instance-url-requires-robots-txt",
    create: () => {
        return {
            file: async ({ config }) => {
                if (config.experimental?.robotsTxtOnInstanceUrl !== true || config.agents?.robotsTxt != null) {
                    return [];
                }
                return [
                    {
                        severity: "warning",
                        message:
                            "experimental.robots-txt-on-instance-url has no effect without a custom robots.txt. Set agents.robots-txt to the file to serve on the instance URL."
                    }
                ];
            }
        };
    }
};
