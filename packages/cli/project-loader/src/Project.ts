import { ProjectConfig } from "@fern-api/project-configuration";
import { APIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

export interface Project {
    config: ProjectConfig;
    apis: InlinedAPIWorkspace | MultipleAPIWorkspaces;
    // docs: InlinedDocsWorkspace | MultipleDocsWorkspace;
}

// API Workspaces

export interface InlinedAPIWorkspace {
    type: "inlined";
    workspace: APIWorkspace;
}

export interface MultipleAPIWorkspaces {
    type: "multi";
    workspaces: NamedApiWorkspace[];
}

export interface NamedApiWorkspace {
    name: string;
    value: APIWorkspace;
}

// Docs Workspaces

export interface InlinedDocsWorkspace {
    type: "inlined";
    workspace: APIWorkspace;
}

export interface MultipleDocsWorkspace {
    type: "multi";
    workspaces: NamedDocsWorkspace[];
}

export interface NamedDocsWorkspace {
    name: string;
    value: DocsWorkspace;
}
