import { Rule } from "../../Rule";

export const PlaygroundEnvironmentsExistRule: Rule = {
    name: "playground-environments-exist",
    create: () => ({
        apiSection: async ({ workspace, context, config }) => {
            const apiSpecificationEnvironments = (await workspace.getDefinition({ context })).rootApiFile.contents
                .environments;

            const availableEnvironmentIds = new Set(Object.keys(apiSpecificationEnvironments ?? {}));
            const playgroundEnvironmentIds = config.playground?.environments;

            if (playgroundEnvironmentIds == null || playgroundEnvironmentIds.length == null) {
                return [];
            }

            const nonExistentEnviromentIds = playgroundEnvironmentIds.filter((id) => !availableEnvironmentIds.has(id));

            if (nonExistentEnviromentIds.length === 0) {
                return [];
            }

            if (nonExistentEnviromentIds.length === 1) {
                return [
                    {
                        severity: "error",
                        message: `The API does not contain the ${nonExistentEnviromentIds[0]} environment. ${
                            getExistingEnviromentIds(Array.from(availableEnvironmentIds)) ?? ""
                        }`
                    }
                ];
            }

            return [
                {
                    severity: "error",
                    message: `The API does not contain the following enviroments: ${nonExistentEnviromentIds.join(
                        ", "
                    )}. ${getExistingEnviromentIds(Array.from(availableEnvironmentIds)) ?? ""}`
                }
            ];
        }
    })
};

function getExistingEnviromentIds(availableEnvironmentIds: string[]): string | undefined {
    if (availableEnvironmentIds.length === 0) {
        return undefined;
    }
    if (availableEnvironmentIds.length === 1 && availableEnvironmentIds[0] != null) {
        return `The only configured environment is ${availableEnvironmentIds[0]}`;
    }
    return `Existing enviroments include ${availableEnvironmentIds.join(", ")}.`;
}
