import { FernToken } from "@fern-api/auth";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspaceMetadata } from "@fern-api/workspace-loader";

export async function generateWorkspace({
    organization,
    projectConfig,
    workspaceGetter,
    context,
    version,
    shouldLogS3Url,
    token,
    useLocalDocker,
    keepDocker
}: {
    organization: string;
    workspaceGetter: (
        sdkLanguage: generatorsYml.GenerationLanguage | undefined
    ) => Promise<FernWorkspaceMetadata | undefined>;
    projectConfig: fernConfigJson.ProjectConfig;
    context: TaskContext;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
    useLocalDocker: boolean;
    keepDocker: boolean;
}): Promise<void> {
    if (useLocalDocker) {
        await runLocalGenerationForWorkspace({
            projectConfig,
            workspaceGetter,
            keepDocker,
            context
        });
    } else {
        await runRemoteGenerationForAPIWorkspace({
            projectConfig,
            organization,
            workspaceGetter,
            context,
            version,
            shouldLogS3Url,
            token
        });
    }
}
