import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { fernConfigJson } from "@fern-api/configuration-loader";
import { DocsWorkspace } from "@fern-api/workspace-loader";

export interface Project {
    config: fernConfigJson.ProjectConfig;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    docsWorkspaces: DocsWorkspace | undefined;
    loadAPIWorkspace: (name: string | undefined) => AbstractAPIWorkspace<unknown> | undefined;
}
