import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import {
    APIS_DIRECTORY,
    ASYNCAPI_DIRECTORY,
    DEFINITION_DIRECTORY,
    DOCS_CONFIGURATION_FILENAME,
    FERN_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    generatorsYml,
    getFernDirectory,
    loadProjectConfig,
    OPENAPI_DIRECTORY
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { handleFailedWorkspaceParserResult, loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";

import { Project } from "./Project";

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
        nameOverride?: string;
        sdkLanguage?: generatorsYml.GenerationLanguage;
        preserveSchemaIds?: boolean;
    }

    export interface LoadProjectFromDirectoryArgs extends Args {
        absolutePathToFernDirectory: AbsoluteFilePath;
    }
}

export async function loadProject({ context, nameOverride, ...args }: loadProject.Args): Promise<Project> {
    const fernDirectory = await getFernDirectory(nameOverride);
    if (fernDirectory == null) {
        return context.failAndThrow(`Directory "${nameOverride ?? FERN_DIRECTORY}" not found.`);
    }

    return await loadProjectFromDirectory({
        absolutePathToFernDirectory: fernDirectory,
        context,
        nameOverride,
        ...args
    });
}

export async function loadProjectFromDirectory({
    absolutePathToFernDirectory,
    cliName,
    cliVersion,
    commandLineApiWorkspace,
    defaultToAllApiWorkspaces,
    context
}: loadProject.LoadProjectFromDirectoryArgs): Promise<Project> {
    let apiWorkspaces: AbstractAPIWorkspace<unknown>[] = [];

    if (
        (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY)))) ||
        (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(DEFINITION_DIRECTORY)))) ||
        (await doesPathExist(
            join(absolutePathToFernDirectory, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME))
        )) ||
        (await doesPathExist(
            join(absolutePathToFernDirectory, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE))
        )) ||
        (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(OPENAPI_DIRECTORY)))) ||
        (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(ASYNCAPI_DIRECTORY))))
    ) {
        apiWorkspaces = await loadApis({
            cliName,
            fernDirectory: absolutePathToFernDirectory,
            cliVersion,
            context,
            commandLineApiWorkspace,
            defaultToAllApiWorkspaces
        });
    }

    const docsWorkspaces = await loadDocsWorkspace({ fernDirectory: absolutePathToFernDirectory, context });

    if (apiWorkspaces.length === 0 && docsWorkspaces == null) {
        return context.failAndThrow(
            `No SDK specifications or docs specifications found. Please ensure one of the following .yml (not .yaml) files is present:\n` +
                ` › ${GENERATORS_CONFIGURATION_FILENAME}\n` +
                ` › ${DOCS_CONFIGURATION_FILENAME}\n` +
                `Or one of the following directories:\n` +
                ` › ${APIS_DIRECTORY}/\n` +
                ` › ${DEFINITION_DIRECTORY}/\n` +
                ` › ${OPENAPI_DIRECTORY}/\n` +
                ` › ${ASYNCAPI_DIRECTORY}/\n\n` +
                `For more information:\n` +
                ` › SDK project structure: https://buildwithfern.com/learn/api-definitions/overview/project-structure\n` +
                ` › Docs project structure: https://buildwithfern.com/learn/docs/getting-started/project-structure`
        );
    }

    return {
        config: await loadProjectConfig({ directory: absolutePathToFernDirectory, context }),
        apiWorkspaces,
        docsWorkspaces,
        loadAPIWorkspace: (name: string | undefined): AbstractAPIWorkspace<unknown> | undefined => {
            if (name == null) {
                return apiWorkspaces[0];
            }
            return apiWorkspaces.find((workspace) => workspace.workspaceName === name);
        }
    };
}

export async function loadApis({
    cliName,
    fernDirectory,
    context,
    cliVersion,
    commandLineApiWorkspace,
    defaultToAllApiWorkspaces
}: {
    cliName: string;
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    commandLineApiWorkspace: string | undefined;
    defaultToAllApiWorkspaces: boolean;
}): Promise<AbstractAPIWorkspace<unknown>[]> {
    const apisDirectory = join(fernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    const apisDirectoryExists = await doesPathExist(apisDirectory);
    if (apisDirectoryExists) {
        const apiDirectoryContents = await readdir(apisDirectory, { withFileTypes: true });

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

        const apiWorkspaces: AbstractAPIWorkspace<unknown>[] = [];

        const filteredWorkspaces =
            commandLineApiWorkspace != null
                ? apiWorkspaceDirectoryNames.filter((api) => {
                      return api === commandLineApiWorkspace;
                  })
                : apiWorkspaceDirectoryNames;

        await Promise.all(
            filteredWorkspaces.map(async (workspaceDirectoryName) => {
                const workspace = await loadAPIWorkspace({
                    absolutePathToWorkspace: join(apisDirectory, RelativeFilePath.of(workspaceDirectoryName)),
                    context,
                    cliVersion,
                    workspaceName: workspaceDirectoryName
                });
                if (workspace.didSucceed) {
                    apiWorkspaces.push(workspace.workspace);
                } else {
                    handleFailedWorkspaceParserResult(workspace, context.logger);
                    context.failAndThrow();
                }
            })
        );

        return apiWorkspaces;
    }

    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fernDirectory,
        context,
        cliVersion,
        workspaceName: undefined
    });
    if (workspace.didSucceed) {
        return [workspace.workspace];
    } else {
        handleFailedWorkspaceParserResult(workspace, context.logger);
        return [];
    }
}
