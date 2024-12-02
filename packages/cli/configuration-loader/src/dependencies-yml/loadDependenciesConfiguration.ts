import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { convertDependenciesConfiguration } from "./convertDependenciesConfiguration";
import { loadRawDependenciesConfiguration } from "./loadRawDependenciesConfiguration";
import { dependenciesYml } from "@fern-api/configuration";

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
