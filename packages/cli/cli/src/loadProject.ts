import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig, ProjectConfig } from "@fern-api/project-configuration";
import { TASK_FAILURE } from "@fern-api/task-context";
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

export async function loadProject(args: loadProject.Args): Promise<Project> {
    const project = await tryLoadProject(args);
    if (project === TASK_FAILURE) {
        return args.cliContext.exit();
    }
    return project;
}

async function tryLoadProject({
    commandLineWorkspace,
    defaultToAllWorkspaces,
    cliContext,
}: loadProject.Args): Promise<Project | TASK_FAILURE> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        cliContext.fail(`Directory ${FERN_DIRECTORY} not found.`);
        return TASK_FAILURE;
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

    if (allWorkspaces === TASK_FAILURE) {
        return TASK_FAILURE;
    }

    if (allWorkspaces.length === 0) {
        cliContext.fail("No APIs found.");
        return TASK_FAILURE;
    }

    const filteredWorkspaces = await maybeFilterWorkspaces({
        allWorkspaces,
        commandLineWorkspace,
        defaultToAllWorkspaces,
        cliContext,
    });

    if (filteredWorkspaces === TASK_FAILURE) {
        return TASK_FAILURE;
    }

    cliContext.registerWorkspaces(filteredWorkspaces);

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
}): Promise<Workspace[] | TASK_FAILURE> {
    const allWorkspaces: Workspace[] = [];

    let encounteredError = false;

    await Promise.all(
        allWorkspaceDirectoryNames.map(async (workspaceDirectoryName) => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(workspaceDirectoryName)),
            });
            if (workspace.didSucceed) {
                allWorkspaces.push(workspace.workspace);
            } else {
                handleFailedWorkspaceParserResult(workspace, cliContext.logger);
                cliContext.fail();
                encounteredError = true;
            }
        })
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (encounteredError) {
        return TASK_FAILURE;
    }

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
}): Promise<Workspace[] | TASK_FAILURE> {
    if (commandLineWorkspace == null) {
        if (allWorkspaces.length > 1 && !defaultToAllWorkspaces) {
            let message = "There are multiple workspaces. You must specify one with --api:\n";
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
            return TASK_FAILURE;
        }

        return [...allWorkspaces];
    }

    let encounteredError = false;

    const filteredWorkspaces = [commandLineWorkspace].reduce<Workspace[]>((acc, workspaceName) => {
        const workspace = allWorkspaces.find((workspace) => workspace.name === workspaceName);
        if (workspace == null) {
            cliContext.fail(`Workspace ${workspaceName} not found`);
            encounteredError = true;
            return acc;
        } else {
            acc.push(workspace);
        }
        return acc;
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (encounteredError) {
        return TASK_FAILURE;
    }

    return filteredWorkspaces;
}
