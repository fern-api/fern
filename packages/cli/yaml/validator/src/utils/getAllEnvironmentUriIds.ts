import { FernWorkspace } from "@fern-api/workspace-loader";
import { isRawMultipleBaseUrlsEnvironment } from "@fern-api/yaml-schema";

export async function getAllEnvironmentUrlIds(workspace: FernWorkspace): Promise<string[]> {
    const workspaceDefinition = await workspace.getDefinition();
    if (workspaceDefinition.rootApiFile.contents.environments == null) {
        return [];
    }

    return Object.values(workspaceDefinition.rootApiFile.contents.environments).reduce<string[]>((set, environment) => {
        if (isRawMultipleBaseUrlsEnvironment(environment)) {
            for (const urlId of Object.keys(environment.urls)) {
                if (!set.includes(urlId)) {
                    set.push(urlId);
                }
            }
        }
        return set;
    }, []);
}
