import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { APIS_DIRECTORY, FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "./handleFailedWorkspaceParserResult";
import { InlinedAPIWorkspace, MultipleAPIWorkspaces, NamedApiWorkspace, Project } from "./Project";

export declare namespace loadProject {
    export interface Args {
        cliName: string;
        cliVersion: string;
        commandLineApiWorkspace: string | undefined;
        /**
         * if false and commandLineWorkspace it not defined,
         * loadProject will cause the CLI to fail
         */
        defaultToAllApiWorkspaces: boolean;
        context: TaskContext;
    }
}

export async function loadProject({
    cliName,
    cliVersion,
    commandLineApiWorkspace,
    defaultToAllApiWorkspaces,
    context,
}: loadProject.Args): Promise<Project> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }

    const apis = await loadApis({
        cliName,
        fernDirectory,
        cliVersion,
        context,
        commandLineApiWorkspace,
        defaultToAllApiWorkspaces,
    });

    return {
        config: await loadProjectConfig({ directory: fernDirectory, context }),
        apis,
    };
}

async function loadApis({
    cliName,
    fernDirectory,
    context,
    cliVersion,
    commandLineApiWorkspace,
    defaultToAllApiWorkspaces,
}: {
    cliName: string;
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    commandLineApiWorkspace: string | undefined;
    defaultToAllApiWorkspaces: boolean;
}): Promise<InlinedAPIWorkspace | MultipleAPIWorkspaces> {
    const apisDirectory = join(fernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    const apisDirectoryExists = await doesPathExist(apisDirectory);
    if (apisDirectoryExists) {
        const apiDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });

        const apiWorkspaceDirectoryNames = apiDirectoryContents.reduce<string[]>((all, item) => {
            if (item.isDirectory()) {
                all.push(item.name);
            }
            return all;
        }, []);

        if (commandLineApiWorkspace != null) {
            if (!apiWorkspaceDirectoryNames.includes(commandLineApiWorkspace)) {
                return context.failAndThrow("API does not exist: " + commandLineApiWorkspace);
            }
        } else if (apiWorkspaceDirectoryNames.length === 0) {
            return context.failAndThrow("No APIs found.");
        } else if (apiWorkspaceDirectoryNames.length > 1 && !defaultToAllApiWorkspaces) {
            let message = "There are multiple workspaces. You must specify one with --api:\n";
            const longestWorkspaceName = Math.max(
                ...apiWorkspaceDirectoryNames.map((workspaceName) => workspaceName.length)
            );
            message += apiWorkspaceDirectoryNames
                .map((workspaceName) => {
                    const suggestedCommand = `${cliName} ${process.argv.slice(2).join(" ")} --api ${workspaceName}`;
                    return ` › ${chalk.bold(workspaceName.padEnd(longestWorkspaceName))}  ${chalk.dim(
                        suggestedCommand
                    )}`;
                })
                .join("\n");
            return context.failAndThrow(message);
        }

        const apiWorkspaces: NamedApiWorkspace[] = [];

        await Promise.all(
            apiWorkspaceDirectoryNames.map(async (workspaceDirectoryName) => {
                const workspace = await loadAPIWorkspace({
                    absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(workspaceDirectoryName)),
                    context,
                    cliVersion,
                });
                if (workspace.didSucceed) {
                    apiWorkspaces.push({
                        name: workspaceDirectoryName,
                        value: workspace.workspace,
                    });
                } else {
                    handleFailedWorkspaceParserResult(workspace, context.logger);
                    context.failAndThrow();
                }
            })
        );

        return {
            type: "multi",
            workspaces: apiWorkspaces,
        };
    }

    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(fernDirectory)),
        context,
        cliVersion,
    });
    if (workspace.didSucceed) {
        return {
            type: "inlined",
            workspace: workspace.workspace,
        };
    } else {
        handleFailedWorkspaceParserResult(workspace, context.logger);
        context.failAndThrow();
    }
}
