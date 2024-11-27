import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { dependenciesYml } from "@fern-api/configuration";
import { convertDependenciesConfiguration } from "./convertDependenciesConfiguration";
import { loadRawDependenciesConfiguration } from "./loadRawDependenciesConfiguration";

export async function loadDependenciesConfiguration({
    absolutePathToWorkspace,
    context
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<dependenciesYml.DependenciesConfiguration> {
    const rawDependenciesConfiguration = await loadRawDependenciesConfiguration({
        absolutePathToWorkspace,
        context
    });
    return convertDependenciesConfiguration({
        absolutePathToWorkspace,
        rawDependenciesConfiguration,
        context
    });
}
