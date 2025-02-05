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

            const nonExistentEnvironmentIds = playgroundEnvironmentIds.filter((id) => !availableEnvironmentIds.has(id));

            if (nonExistentEnvironmentIds.length === 0) {
                return [];
            }

            if (nonExistentEnvironmentIds.length === 1) {
                return [
                    {
                        severity: "fatal",
                        message: `The API does not contain the ${nonExistentEnvironmentIds[0]} environment. ${
                            getExistingEnvironmentIds(Array.from(availableEnvironmentIds)) ?? ""
                        }`
                    }
                ];
            }

            return [
                {
                    severity: "fatal",
                    message: `The API does not contain the following environments: ${nonExistentEnvironmentIds.join(
                        ", "
                    )}. ${getExistingEnvironmentIds(Array.from(availableEnvironmentIds)) ?? ""}`
                }
            ];
        }
    })
};

function getExistingEnvironmentIds(availableEnvironmentIds: string[]): string | undefined {
    if (availableEnvironmentIds.length === 0) {
        return undefined;
    }
    if (availableEnvironmentIds.length === 1 && availableEnvironmentIds[0] != null) {
        return `The only configured environment is ${availableEnvironmentIds[0]}`;
    }
    return `Existing environments include ${availableEnvironmentIds.join(", ")}.`;
}
