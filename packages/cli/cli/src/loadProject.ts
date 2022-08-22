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
        return cliContext.fail(`Directory ${FERN_DIRECTORY} not found.`);
    }
    const fernDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });
    const allWorkspaceDirectoryNames = fernDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    if (commandLineWorkspace != null) {
        if (!allWorkspaceDirectoryNames.includes(commandLineWorkspace)) {
            return cliContext.fail("API does not exist: " + commandLineWorkspace);
        }
    } else if (allWorkspaceDirectoryNames.length === 0) {
        return cliContext.fail("No APIs found.");
    } else if (allWorkspaceDirectoryNames.length > 1 && !defaultToAllWorkspaces) {
        let message = "There are multiple workspaces. You must specify one with --api:\n";
        const longestWorkspaceName = Math.max(
            ...allWorkspaceDirectoryNames.map((workspaceName) => workspaceName.length)
        );
        message += allWorkspaceDirectoryNames
            .map((workspaceName) => {
                const suggestedCommand = `${cliContext.environment.cliName} --api ${workspaceName} ${process.argv
                    .slice(2)
                    .join(" ")}`;
                return ` › ${chalk.bold(workspaceName.padEnd(longestWorkspaceName))}  ${chalk.dim(suggestedCommand)}`;
            })
            .join("\n");
        return cliContext.fail(message);
    }

    const workspaces = await loadWorkspaces({
        fernDirectory,
        workspaceDirectoryNames:
            commandLineWorkspace != null ? [commandLineWorkspace] : [...allWorkspaceDirectoryNames],
        cliContext,
    });

    if (workspaces === TASK_FAILURE) {
        return workspaces;
    }

    cliContext.registerWorkspaces(workspaces);

    return {
        config: await loadProjectConfig({ directory: fernDirectory }),
        workspaces,
    };
}

async function loadWorkspaces({
    fernDirectory,
    workspaceDirectoryNames,
    cliContext,
}: {
    fernDirectory: AbsoluteFilePath;
    workspaceDirectoryNames: string[];
    cliContext: CliContext;
}): Promise<Workspace[] | TASK_FAILURE> {
    const allWorkspaces: Workspace[] = [];

    let encounteredError = false;

    await Promise.all(
        workspaceDirectoryNames.map(async (workspaceDirectoryName) => {
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
