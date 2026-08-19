import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { Project } from "@fern-api/project-loader";
import { LegacyOSSWorkspaceAdapter } from "../../api/adapter/LegacyOSSWorkspaceAdapter.js";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { LegacyDocsWorkspaceAdapter } from "./LegacyDocsWorkspaceAdapter.js";

/**
 * Adapts a Workspace to the legacy Project interface.
 */
export class LegacyProjectAdapter {
    private readonly context: Context;
    private readonly docsAdapter = new LegacyDocsWorkspaceAdapter();
    private readonly ossAdapter: LegacyOSSWorkspaceAdapter;

    constructor({ context }: { context: Context }) {
        this.context = context;
        this.ossAdapter = new LegacyOSSWorkspaceAdapter({ context });
    }

    public async adapt(workspace: Workspace): Promise<Project> {
        const apiWorkspaces = await this.buildApiWorkspaces(workspace);
        const docsWorkspace =
            workspace.docs != null
                ? this.docsAdapter.adapt({
                      docsConfig: workspace.docs,
                      absoluteFilePath:
                          workspace.docs.absoluteFilePath ?? workspace.absoluteFilePath ?? this.context.cwd
                  })
                : undefined;
        return {
            config: {
                _absolutePath: workspace.absoluteFilePath ?? this.context.cwd,
                rawConfig: {
                    organization: workspace.org,
                    version: workspace.cliVersion
                },
                organization: workspace.org,
                version: workspace.cliVersion
            },
            apiWorkspaces,
            docsWorkspaces: docsWorkspace,
            loadAPIWorkspace: (name: string | undefined) => {
                if (name == null && apiWorkspaces.length === 1) {
                    return apiWorkspaces[0];
                }
                return apiWorkspaces.find((ws) => ws.workspaceName === name);
            }
        };
    }

    /**
     * Bridges API definitions to legacy AbstractAPIWorkspace instances.
     */
    private async buildApiWorkspaces(workspace: Workspace): Promise<AbstractAPIWorkspace<unknown>[]> {
        const workspaces: AbstractAPIWorkspace<unknown>[] = [];
        const taskContext = new TaskContextAdapter({ context: this.context });
        for (const [apiName, apiDef] of Object.entries(workspace.apis)) {
            const ossWorkspace = this.ossAdapter.build({
                definition: apiDef,
                workspaceName: apiName,
                cliVersion: workspace.cliVersion,
                absoluteFilePath: this.context.cwd
            });
            if (ossWorkspace != null) {
                // Resolve GraphQL specs into operations/types so docs can render them.
                await ossWorkspace.processGraphQLSpecs(taskContext);
                workspaces.push(ossWorkspace);
            }
        }
        return workspaces;
    }
}
