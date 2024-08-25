import { fernConfigJson } from "@fern-api/configuration";
import { APIWorkspace, DocsWorkspace, LazyFernWorkspace, OSSWorkspace } from "@fern-api/workspace-loader";
export interface Project {
    config: fernConfigJson.ProjectConfig;
    apiWorkspaces: (OSSWorkspace | LazyFernWorkspace)[];
    docsWorkspaces: DocsWorkspace | undefined;
    loadAPIWorkspace: (name: string | undefined) => APIWorkspace | undefined;
}
