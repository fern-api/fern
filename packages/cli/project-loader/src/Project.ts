import { ProjectConfig } from "@fern-api/project-configuration";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

export interface Project {
    config: ProjectConfig;
    apiWorkspaces: APIWorkspace[];
    docsWorkspaces: DocsWorkspace[];
}
