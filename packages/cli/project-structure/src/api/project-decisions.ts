import { hasGeneratorsFile } from "../generation/index.js";
import { ProjectDir } from "../workspace/index.js";

/** Whether the fern directory configures an API through `apis/`, `definition/` or a generators file. */
export function hasApiConfiguration(project: ProjectDir): boolean {
    return project.apis != null || project.root.hasDefinitionDirectory || hasGeneratorsFile(project.root);
}

/**
 * Whether the API workspaces have to be loaded.
 *
 * An `openapi/` or `asyncapi/` folder is not an API on its own. With no API configuration, a docs.yml that lists its
 * specs inline is the only thing that can use such a folder, so loading it as an API would only report an error.
 */
export function shouldLoadApiWorkspaces({
    project,
    docsHaveInlineSpecs,
    skipApiWorkspaces
}: {
    project: ProjectDir;
    docsHaveInlineSpecs: boolean;
    skipApiWorkspaces: boolean;
}): boolean {
    if (hasApiConfiguration(project)) {
        return true;
    }
    const { root } = project;
    if ((root.hasOpenapiDirectory || root.hasAsyncapiDirectory) && !docsHaveInlineSpecs) {
        return true;
    }
    return skipApiWorkspaces && root.sdkConfigFile != null;
}

/**
 * Whether the fern directory itself owns an `sdk-config.yml`, next to whatever is in `apis/`.
 *
 * With `apis/` it always does. Without it, only when nothing else has claimed the project already.
 */
export function rootOwnsSdkConfig({
    project,
    apiRequested,
    skipApiWorkspaces,
    loadedApiCount,
    sdkConfigOwnerCount
}: {
    project: ProjectDir;
    apiRequested: boolean;
    skipApiWorkspaces: boolean;
    loadedApiCount: number;
    sdkConfigOwnerCount: number;
}): boolean {
    if (project.root.sdkConfigFile == null || apiRequested) {
        return false;
    }
    if (project.apis != null) {
        return true;
    }
    return !skipApiWorkspaces && loadedApiCount === 0 && sdkConfigOwnerCount === 0;
}
