import { ProjectConfig } from "@fern-api/project-configuration";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
interface Project {
    config: ProjectConfig;
    apiWorkspaces: APIWorkspace[];
    docsWorkspaces: DocsWorkspace | undefined;
}
