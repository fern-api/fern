import { Rule, RuleViolation } from "../../Rule";

export const PlaygroundEnvironmentsExistRule: Rule = {
    name: "playground-environments-exist",
    create: () => {
        return {
            apiSection: async ({ workspace, context, config }) => {
                const maybeApiSpecificationEnvironments = (await workspace.getDefinition({ context })).rootApiFile
                    .contents.environments;
                const apiSectionPlaygroundEnvironmentIds = config.playground?.environments;
                if (!maybeApiSpecificationEnvironments) {
                    if (apiSectionPlaygroundEnvironmentIds && apiSectionPlaygroundEnvironmentIds.length > 0) {
                        return [
                            {
                                severity: "error",
                                message:
                                    "Cannot specify playground environments if there are no environments supplied in the API specification."
                            }
                        ];
                    }
                } else {
                    const availableEnvironmentIds = new Set(Object.keys(maybeApiSpecificationEnvironments));
                    const violations: RuleViolation[] = [];
                    apiSectionPlaygroundEnvironmentIds?.forEach((environmentId) => {
                        if (!availableEnvironmentIds.has(environmentId)) {
                            violations.push({
                                severity: "error",
                                message: `Invalid environment id supplied in playground settings: ${environmentId}`
                            });
                        }
                    });
                    return violations;
                }

                return [];
            }
        };
    }
};
