import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { fernConfigJson } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";

export interface Project {
    config: fernConfigJson.ProjectConfig;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    /** SDK Config-only workspaces whose sources are owned by sdk-config.yml. */
    sdkConfigWorkspaces?: SdkConfigWorkspace[];
    docsWorkspaces: DocsWorkspace | undefined;
    loadAPIWorkspace: (name: string | undefined) => AbstractAPIWorkspace<unknown> | undefined;
}

export interface SdkConfigWorkspace {
    absoluteFilePath: AbsoluteFilePath;
    workspaceName: string | undefined;
}
