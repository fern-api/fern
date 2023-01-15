import { Workspace } from "@fern-api/workspace-loader";
import { isRawMultipleBaseUrlsEnvironment } from "@fern-api/yaml-schema";

export function getAllEnvironmentUrlIds(workspace: Workspace): string[] {
    if (workspace.rootApiFile.environments == null) {
        return [];
    }

    return Object.values(workspace.rootApiFile.environments).reduce<string[]>((set, environment) => {
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
