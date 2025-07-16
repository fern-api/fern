import path from "path";

import { dependenciesYml } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { TaskContext, TaskResult } from "@fern-api/task-context";

const EMPTY_DEPENDENCIES_CONFIGURATION: dependenciesYml.DependenciesConfiguration = {
    dependencies: {}
};

export async function convertDependenciesConfiguration({
    absolutePathToWorkspace,
    rawDependenciesConfiguration,
    context
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    rawDependenciesConfiguration: dependenciesYml.DependenciesConfigurationSchema | undefined;
    context: TaskContext;
}): Promise<dependenciesYml.DependenciesConfiguration> {
    if (rawDependenciesConfiguration == null) {
        return EMPTY_DEPENDENCIES_CONFIGURATION;
    }

    const dependencies: Record<string, dependenciesYml.Dependency> = {};
    for (const [coordinate, versionOrPath] of Object.entries(rawDependenciesConfiguration.dependencies)) {
        if (isPath(versionOrPath)) {
            const pathToApi = AbsoluteFilePath.of(path.join(absolutePathToWorkspace, versionOrPath));
            if (await doesPathExist(pathToApi)) {
                dependencies[coordinate] = {
                    type: "local",
                    absoluteFilepath: pathToApi,
                    path: versionOrPath
                };
            } else {
                // don't throw so we can log all failures
                context.failWithoutThrowing(`Path to ${coordinate} dependency does not exist: ${pathToApi}`);
            }
        } else {
            const unprefixedCoordinate = coordinate.substring(1);
            const splitCoordinate = unprefixedCoordinate.split("/");
            const organization = splitCoordinate[0];
            const apiName = splitCoordinate[1];
            if (organization != null && apiName != null) {
                dependencies[coordinate] = {
                    type: "version",
                    organization,
                    apiName,
                    version: versionOrPath
                };
            } else {
                // don't throw so we can log all failures
                context.failWithoutThrowing(`Failed to parse dependency: ${coordinate}`);
            }
        }
    }

    if (context.getResult() === TaskResult.Failure) {
        context.failAndThrow();
    }

    return {
        dependencies
    };
}

const RELATIVE_PATH_UP_ONE_DIRECTORY_PATTERN = /^\.\.\/.*$/;
function isPath(value: string): boolean {
    return RELATIVE_PATH_UP_ONE_DIRECTORY_PATTERN.test(value);
}
