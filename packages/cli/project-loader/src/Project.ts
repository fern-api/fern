import { fernConfigJson } from "@fern-api/configuration";
import { DocsWorkspace, OSSWorkspace } from "@fern-api/workspace-loader";
import { LazyFernWorkspace } from "@fern-api/workspace-loader/src/workspaces/FernWorkspace";
export interface Project {
    config: fernConfigJson.ProjectConfig;
    apiWorkspaces: (OSSWorkspace | LazyFernWorkspace)[];
    docsWorkspaces: DocsWorkspace | undefined;
}
