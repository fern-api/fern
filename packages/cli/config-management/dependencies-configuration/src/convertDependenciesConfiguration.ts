import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import path from "path";
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
    for (const [coordinate, versionOrPath] of Object.entries(rawDependenciesConfiguration.dependencies)) {
        if (isVersion(versionOrPath)) {
            const unprefixedCoordinate = coordinate.substring(1);
            const splitCoordinate = unprefixedCoordinate.split("/");
            const organization = splitCoordinate[0];
            const apiName = splitCoordinate[1];
            if (organization != null && apiName != null) {
                dependencies[coordinate] = {
                    type: "version",
                    organization,
                    apiName,
                    version: versionOrPath,
                };
            } else {
                // don't throw so we can log all failures
                context.failWithoutThrowing(`Failed to parse dependency: ${coordinate}`);
            }
        } else {
            const pathToApi = AbsoluteFilePath.of(path.join(__dirname, versionOrPath));
            if (await doesPathExist(pathToApi)) {
                dependencies[coordinate] = {
                    type: "local",
                    absoluteFilepath: pathToApi,
                    path: versionOrPath,
                };
            } else {
                // don't throw so we can log all failures
                context.failWithoutThrowing(`Path to ${coordinate} dependency does not exist: ${versionOrPath}`);
            }
        }
    }

    if (context.getResult() === TaskResult.Failure) {
        context.failAndThrow();
    }

    return {
        dependencies,
    };
}

const VERSION_PATTERN = /.+@.+/;
function isVersion(input: string): boolean {
    return VERSION_PATTERN.test(input);
}
