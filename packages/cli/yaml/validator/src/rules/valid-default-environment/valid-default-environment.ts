import { Rule } from "../../Rule";

export const ValidDefaultEnvironmentRule: Rule = {
    name: "valid-default-environment",
    create: ({ workspace }) => {
        const environments = workspace.rootApiFile.environments;
        return {
            defaultEnvironment: (defaultEnvironment) => {
                if (defaultEnvironment != null) {
                    if (environments == null || !(defaultEnvironment in Object.keys(environments))) {
                        return [
                            {
                                severity: "error",
                                message: `The default-environment ${defaultEnvironment} is not listed as an environment`,
                            },
                        ];
                    }
                } else if (environments != null) {
                    return [
                        {
                            severity: "error",
                            message: "Please specify a default-environment. If no default, use null",
                        },
                    ];
                }
                return [];
            },
        };
    },
};
