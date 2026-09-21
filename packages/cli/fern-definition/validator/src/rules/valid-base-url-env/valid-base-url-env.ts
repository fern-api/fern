import { Rule } from "../../Rule.js";

export const ValidBaseUrlEnvRule: Rule = {
    name: "valid-base-url-env",
    create: ({ workspace }) => {
        const environments = workspace.definition.rootApiFile.contents.environments;
        return {
            rootApiFile: {
                baseUrlEnv: (baseUrlEnv) => {
                    if (baseUrlEnv == null) {
                        return [];
                    }
                    if (environments == null || Object.keys(environments).length === 0) {
                        return [
                            {
                                severity: "warning",
                                message:
                                    `base-url-env ${baseUrlEnv} has no effect because no environments are declared. ` +
                                    "The environment variable overrides the default environment, so it is only read " +
                                    "when at least one environment exists. Add an environments block, or remove base-url-env."
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
