import { fernConfigJson } from "@fern-api/configuration";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
export interface Project {
    config: fernConfigJson.ProjectConfig;
    apiWorkspaces: APIWorkspace[];
    docsWorkspaces: DocsWorkspace | undefined;
}
