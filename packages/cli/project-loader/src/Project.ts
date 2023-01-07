import { ProjectConfig } from "@fern-api/project-configuration";
import { Workspace } from "@fern-api/workspace-loader";

export interface Project {
    config: ProjectConfig;
    workspaces: Workspace[];
    token: string | undefined;
}
