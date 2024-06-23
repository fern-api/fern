import { fernConfigJson } from "@fern-api/configuration";
import { DocsWorkspace, FernWorkspace, OSSWorkspace } from "@fern-api/workspace-loader";
export interface Project {
    config: fernConfigJson.ProjectConfig;
    apiWorkspaces: (OSSWorkspace | FernWorkspace)[];
    docsWorkspaces: DocsWorkspace | undefined;
}
