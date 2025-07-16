import { FernWorkspace } from "@fern-api/api-workspace-commons"
import { isRawMultipleBaseUrlsEnvironment } from "@fern-api/fern-definition-schema"

export function getAllEnvironmentUrlIds(workspace: FernWorkspace): string[] {
    if (workspace.definition.rootApiFile.contents.environments == null) {
        return []
    }

    return Object.values(workspace.definition.rootApiFile.contents.environments).reduce<string[]>(
        (set, environment) => {
            if (isRawMultipleBaseUrlsEnvironment(environment)) {
                for (const urlId of Object.keys(environment.urls)) {
                    if (!set.includes(urlId)) {
                        set.push(urlId)
                    }
                }
            }
            return set
        },
        []
    )
}
