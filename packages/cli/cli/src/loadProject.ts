import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { getFernDirectory, loadProjectConfig, ProjectConfig } from "@fern-api/project-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";
import { CliContext } from "./cli-context/CliContext";
import { handleFailedWorkspaceParserResult } from "./commands/generate-ir/handleFailedWorkspaceParserResult";

export interface Project {
    config: ProjectConfig;
    workspaces: Workspace[];
}

export declare namespace loadProject {
    export interface Args {
        commandLineWorkspace: string | undefined;
        /**
         * if false and commandLineWorkspace it not defined,
         * loadProject will cause the CLI to fail
         */
        defaultToAllWorkspaces: boolean;
        cliContext: CliContext;
    }
}

export async function loadProject({
    commandLineWorkspace,
    defaultToAllWorkspaces,
    cliContext,
}: loadProject.Args): Promise<Project> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndExit();
    }
    const fernDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });
    const allWorkspaceDirectoryNames = fernDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    const allWorkspaces = await loadAllWorkspaces({
        fernDirectory,
        allWorkspaceDirectoryNames,
        cliContext,
    });

    if (allWorkspaces.length === 0) {
        cliContext.logger.error(chalk.red("No APIs found."));
        await cliContext.failAndExit();
    }

    cliContext.registerWorkspaces(allWorkspaces);
    const filteredWorkspaces = await maybeFilterWorkspaces({
        allWorkspaces,
        commandLineWorkspace,
        defaultToAllWorkspaces,
        cliContext,
    });

    return {
        config: await loadProjectConfig({ directory: fernDirectory }),
        workspaces: filteredWorkspaces,
    };
}

async function loadAllWorkspaces({
    fernDirectory,
    allWorkspaceDirectoryNames,
    cliContext,
}: {
    fernDirectory: AbsoluteFilePath;
    allWorkspaceDirectoryNames: string[];
    cliContext: CliContext;
}): Promise<Workspace[]> {
    const allWorkspaces: Workspace[] = [];
    await Promise.all(
        allWorkspaceDirectoryNames.map(async (workspaceDirectoryName) => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(workspaceDirectoryName)),
            });
            if (workspace.didSucceed) {
                allWorkspaces.push(workspace.workspace);
            } else {
                cliContext.fail();
                handleFailedWorkspaceParserResult(workspace, cliContext.logger);
            }
        })
    );
    await cliContext.exitIfFailed();
    return allWorkspaces;
}

async function maybeFilterWorkspaces({
    allWorkspaces,
    commandLineWorkspace,
    defaultToAllWorkspaces,
    cliContext,
}: {
    allWorkspaces: Workspace[];
    commandLineWorkspace: string | undefined;
    defaultToAllWorkspaces: boolean;
    cliContext: CliContext;
}): Promise<Workspace[]> {
    if (commandLineWorkspace == null) {
        if (allWorkspaces.length > 1 && !defaultToAllWorkspaces) {
            let message = chalk.red("There are multiple workspaces. You must specify one with --api:\n");
            const longestWorkspaceName = Math.max(...allWorkspaces.map((workspace) => workspace.name.length));
            message += allWorkspaces
                .map((workspace) => {
                    const suggestedCommand = `fern --api ${workspace.name} ${process.argv.slice(2).join(" ")}`;
                    return ` › ${chalk.bold(workspace.name.padEnd(longestWorkspaceName))}  ${chalk.dim(
                        suggestedCommand
                    )}`;
                })
                .join("\n");
            cliContext.logger.error(message);
            cliContext.fail();
        }
        return [...allWorkspaces];
    }

    const filteredWorkspaces = [commandLineWorkspace].reduce<Workspace[]>((acc, workspaceName) => {
        const workspace = allWorkspaces.find((workspace) => workspace.name === workspaceName);
        if (workspace == null) {
            cliContext.logger.error(chalk.red(`Workspace ${workspaceName} not found`));
            cliContext.fail();
            return acc;
        }
        return [...acc, workspace];
    }, []);

    await cliContext.exitIfFailed();

    return filteredWorkspaces;
}
