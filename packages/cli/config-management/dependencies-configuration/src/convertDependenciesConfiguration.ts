import { TaskContext, TaskResult } from "@fern-api/task-context";
import { DependenciesConfiguration, Dependency } from "./DependenciesConfiguration";
import { DependenciesConfigurationSchema } from "./schemas/DependenciesConfigurationSchema";

const EMPTY_DEPENDENCIES_CONFIGURATION: DependenciesConfiguration = {
    dependencies: {},
};

export async function convertDependenciesConfiguration({
    rawDependenciesConfiguration,
    context,
}: {
    rawDependenciesConfiguration: DependenciesConfigurationSchema | undefined;
    context: TaskContext;
}): Promise<DependenciesConfiguration> {
    if (rawDependenciesConfiguration == null) {
        return EMPTY_DEPENDENCIES_CONFIGURATION;
    }

    const dependencies: Record<string, Dependency> = {};
    for (const [coordinate, version] of Object.entries(rawDependenciesConfiguration.dependencies)) {
        const unprefixedCoordinate = coordinate.substring(1);
        const splitCoordinate = unprefixedCoordinate.split("/");
        const organization = splitCoordinate[0];
        const apiName = splitCoordinate[1];
        if (organization != null && apiName != null) {
            dependencies[coordinate] = {
                organization,
                apiName,
                version,
            };
        } else {
            // don't throw so we can log all failures
            context.failWithoutThrowing(`Failed to parse dependency: ${coordinate}`);
        }
    }

    if (context.getResult() === TaskResult.Failure) {
        context.failAndThrow();
    }

    return {
        dependencies,
    };
}
