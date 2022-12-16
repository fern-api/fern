import { TaskContext } from "@fern-api/task-context";
import { DependenciesFileSchema } from "@fern-api/yaml-schema";

export interface DependenciesConfiguration {
    dependencies: Record<string, DependencyInfo>;
}

export interface DependencyInfo {
    apiName: string;
    org: string;
    version: string;
}

export const EMPTY_DEPENDENCIES_CONFIGURATION: DependenciesConfiguration = {
    dependencies: {},
};

export function loadDependenciesConfiguration({
    dependenciesFile,
    context,
}: {
    dependenciesFile: DependenciesFileSchema;
    context: TaskContext;
}): DependenciesConfiguration {
    if (dependenciesFile.dependencies == null) {
        return EMPTY_DEPENDENCIES_CONFIGURATION;
    }
    const dependencies: Record<string, DependencyInfo> = {};
    for (const [coordinate, version] of Object.entries(dependenciesFile.dependencies)) {
        const unprefixedCoordinate = coordinate.substring(1);
        const splitCoordinate = unprefixedCoordinate.split("/");
        const org = splitCoordinate[0];
        const apiName = splitCoordinate[1];
        if (org != null && apiName != null) {
            dependencies[coordinate] = {
                apiName,
                org,
                version,
            };
        } else {
            context.failAndThrow(`Malformed depenency: ${coordinate}`);
        }
    }
    return {
        dependencies,
    };
}
