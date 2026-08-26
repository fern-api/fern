import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { select } from "@inquirer/prompts";

import { CliContext } from "../../../cli-context/CliContext.js";
import { loadSpecSummaries, SpecSummary } from "./openapiSummary.js";
import { radioChoice, selectTheme } from "./ui.js";

export interface WorkspaceSpec {
    workspace: AbstractAPIWorkspace<unknown>;
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    spec: SpecSummary;
}

function getWorkspaceName(workspace: AbstractAPIWorkspace<unknown>): string {
    return workspace.workspaceName ?? "api";
}

/**
 * Picks the API workspace to operate on (prompting when the project has
 * several and no `--api` was passed) and summarizes its OpenAPI spec.
 */
export async function pickWorkspaceAndLoadSpec({
    project,
    cliContext,
    apiFilter,
    interactive
}: {
    project: Project;
    cliContext: CliContext;
    apiFilter: string | undefined;
    interactive: boolean;
}): Promise<WorkspaceSpec | undefined> {
    let workspaces = project.apiWorkspaces;
    if (apiFilter != null) {
        workspaces = workspaces.filter((workspace) => getWorkspaceName(workspace) === apiFilter);
        if (workspaces.length === 0) {
            cliContext.failAndThrow(`No API named "${apiFilter}" was found in this project.`);
            return undefined;
        }
    }
    let workspace = workspaces[0];
    if (workspaces.length > 1) {
        if (interactive) {
            workspace = await select({
                message: `Which API? (detected ${workspaces.length})`,
                choices: workspaces.map((candidate) => ({
                    name: radioChoice(getWorkspaceName(candidate)),
                    value: candidate
                })),
                theme: selectTheme
            });
        } else {
            cliContext.failAndThrow("Multiple APIs found. Specify one with --api <name>.");
            return undefined;
        }
    }
    if (workspace == null) {
        cliContext.failAndThrow("No API workspaces were found in this project.");
        return undefined;
    }

    const specs = await loadSpecSummaries(workspace.absoluteFilePath);
    const spec = specs[0];
    if (spec == null) {
        cliContext.failAndThrow(
            "No OpenAPI spec was found in this workspace. The MCP prototype currently requires an OpenAPI spec."
        );
        return undefined;
    }
    return {
        workspace,
        workspaceName: getWorkspaceName(workspace),
        absolutePathToWorkspace: workspace.absoluteFilePath,
        spec
    };
}
