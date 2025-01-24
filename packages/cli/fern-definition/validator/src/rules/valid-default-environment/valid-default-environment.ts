import { Rule } from "../../Rule";

export const ValidDefaultEnvironmentRule: Rule = {
    name: "valid-default-environment",
    create: ({ workspace }) => {
        const environments = workspace.definition.rootApiFile.contents.environments;
        return {
            rootApiFile: {
                defaultEnvironment: (defaultEnvironment) => {
                    if (defaultEnvironment != null) {
                        if (environments == null || !Object.keys(environments).includes(defaultEnvironment)) {
                            return [
                                {
                                    severity: "fatal",
                                    message: `The default-environment ${defaultEnvironment} is not listed as an environment`
                                }
                            ];
                        }
                    }
                    return [];
                }
            }
        };
    }
};
