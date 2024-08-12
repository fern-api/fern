import { Rule, RuleViolation } from "../../Rule";

export const PlaygroundEnvironmentsExistRule: Rule = {
    name: "playground-environments-exist",
    create: () => ({
        apiSection: async ({ workspace, context, config }) => {
            const apiSpecificationEnvironments = (await workspace.getDefinition({ context })).rootApiFile.contents
                .environments;
            const playgroundEnvironmentIds = config.playground?.environments || [];

            if (!apiSpecificationEnvironments) {
                if (playgroundEnvironmentIds.length > 0) {
                    return [
                        {
                            severity: "error",
                            message:
                                `${playgroundEnvironmentIds.join(", ")} are not valid environments`
                        }
                    ];
                }
                return [];
            }

            const availableEnvironmentIds = new Set(Object.keys(apiSpecificationEnvironments));
            const violations: RuleViolation[] = playgroundEnvironmentIds
                .filter((id) => !availableEnvironmentIds.has(id))
                .map((id) => ({
                    severity: "error",
                    message: `${invalidEnvironmentIds.join(", ")} are not valid environments. Choose from ${availableEnvironmentIds.join(", ")}`
                }));

            return violations;
        }
    })
};
