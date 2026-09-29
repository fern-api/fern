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
    LEGACY_GENERATORS_CONFIGURATION_FILENAME,
    loadProjectConfig,
    OPENAPI_DIRECTORY,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { handleFailedWorkspaceParserResult, loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";

import { normalizeCommandLineApiWorkspace } from "./normalizeCommandLineApiWorkspace.js";
import { Project, SdkConfigWorkspace } from "./Project.js";

export declare namespace loadProject {
    export interface Args {
        cliName: string;
        cliVersion: string;
        /**
         * The API workspace name(s) supplied via `--api` on the command line. A single string
         * preserves the historical single-`--api` behavior; an array allows callers that accept
         * `--api` multiple times (e.g. `fern generate`) to filter to a union of workspaces.
         * `undefined` means no `--api` flag was supplied.
         */
        commandLineApiWorkspace: string | string[] | undefined;
        /**
         * if false and commandLineWorkspace it not defined,
         * loadProject will cause the CLI to fail
         */
        defaultToAllApiWorkspaces: boolean;
        context: TaskContext;
        nameOverride?: string;
        sdkLanguage?: generatorsYml.GenerationLanguage;
        preserveSchemaIds?: boolean;
        /** Skip legacy API discovery when a caller-owned configuration loader provides the workspace. */
        skipApiWorkspaces?: boolean;
    }

    export interface LoadProjectFromDirectoryArgs extends Args {
        absolutePathToFernDirectory: AbsoluteFilePath;
    }
}

export async function loadProject({ context, nameOverride, ...args }: loadProject.Args): Promise<Project> {
    const fernDirectory = await getFernDirectory(nameOverride);
    if (fernDirectory == null) {
        return context.failAndThrow(`Directory "${nameOverride ?? FERN_DIRECTORY}" not found.`, undefined, {
            code: CliError.Code.ConfigError
        });
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
    skipApiWorkspaces = false,
    context
}: loadProject.LoadProjectFromDirectoryArgs): Promise<Project> {
    let apiWorkspaces: AbstractAPIWorkspace<unknown>[] = [];
    const sdkConfigWorkspaces: SdkConfigWorkspace[] = [];

    const [
        apisExists,
        defExists,
        genExists,
        genAltExists,
        legacyGenExists,
        sdkConfigExists,
        openapiExists,
        asyncapiExists
    ] = await Promise.all([
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY))),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(DEFINITION_DIRECTORY))),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME))),
        doesPathExist(
            join(absolutePathToFernDirectory, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE))
        ),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(LEGACY_GENERATORS_CONFIGURATION_FILENAME))),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(SDK_CONFIG_FILENAME))),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(OPENAPI_DIRECTORY))),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(ASYNCAPI_DIRECTORY)))
    ]);

    if (
        !skipApiWorkspaces &&
        (apisExists || defExists || genExists || genAltExists || legacyGenExists || openapiExists || asyncapiExists)
    ) {
        apiWorkspaces = await loadApis({
            cliName,
            fernDirectory: absolutePathToFernDirectory,
            cliVersion,
            context,
            commandLineApiWorkspace,
            defaultToAllApiWorkspaces,
            sdkConfigWorkspaceCollector: sdkConfigWorkspaces
        });
    }

    if (!skipApiWorkspaces && sdkConfigExists && apiWorkspaces.length === 0 && sdkConfigWorkspaces.length === 0) {
        sdkConfigWorkspaces.push({ absoluteFilePath: absolutePathToFernDirectory, workspaceName: undefined });
    }

    const docsWorkspaces = await loadDocsWorkspace({ fernDirectory: absolutePathToFernDirectory, context });

    if (
        apiWorkspaces.length === 0 &&
        sdkConfigWorkspaces.length === 0 &&
        docsWorkspaces == null &&
        !skipApiWorkspaces &&
        !sdkConfigExists
    ) {
        return context.failAndThrow(
            `No SDK specifications or docs specifications found. Please ensure one of the following .yml (not .yaml) files is present:\n` +
                ` › ${GENERATORS_CONFIGURATION_FILENAME}\n` +
                ` › ${DOCS_CONFIGURATION_FILENAME}\n` +
                `Or one of the following directories:\n` +
                ` › ${APIS_DIRECTORY}/\n` +
                ` › ${DEFINITION_DIRECTORY}/\n` +
                ` › ${OPENAPI_DIRECTORY}/\n` +
                ` › ${ASYNCAPI_DIRECTORY}/\n` +
                `For more information:\n` +
                ` › SDK project structure: https://buildwithfern.com/learn/api-definitions/overview/project-structure\n` +
                ` › Docs project structure: https://buildwithfern.com/learn/docs/getting-started/project-structure`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    return {
        config: await loadProjectConfig({ directory: absolutePathToFernDirectory, context }),
        apiWorkspaces,
        sdkConfigWorkspaces,
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
    defaultToAllApiWorkspaces,
    sdkConfigWorkspaceCollector
}: {
    cliName: string;
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    commandLineApiWorkspace: string | string[] | undefined;
    defaultToAllApiWorkspaces: boolean;
    /** Collect SDK Config-only directories without passing them through legacy workspace parsing. */
    sdkConfigWorkspaceCollector?: SdkConfigWorkspace[];
}): Promise<AbstractAPIWorkspace<unknown>[]> {
    // Normalize `--api` input. `undefined` means no filter; a single string or an array of
    // strings narrows to the named workspace(s). Passing `--api` multiple times produces an
    // array (e.g. `fern generate --api foo --api bar`); callers that still take a single
    // `--api` pass a single string.
    const commandLineApiWorkspaceNames = normalizeCommandLineApiWorkspace(commandLineApiWorkspace);

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

        if (commandLineApiWorkspaceNames != null) {
            const missing = commandLineApiWorkspaceNames.filter((name) => !apiWorkspaceDirectoryNames.includes(name));
            if (missing.length > 0) {
                return context.failAndThrow(
                    missing.length === 1
                        ? "API does not exist: " + missing[0]
                        : "APIs do not exist: " + missing.join(", "),
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
        } else if (apiWorkspaceDirectoryNames.length === 0) {
            return context.failAndThrow("No APIs found.", undefined, { code: CliError.Code.ConfigError });
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
            return context.failAndThrow(message, undefined, { code: CliError.Code.ConfigError });
        }

        const apiWorkspaces: AbstractAPIWorkspace<unknown>[] = [];

        const filteredWorkspaces =
            commandLineApiWorkspaceNames != null
                ? apiWorkspaceDirectoryNames.filter((api) => commandLineApiWorkspaceNames.includes(api))
                : apiWorkspaceDirectoryNames;

        await Promise.all(
            filteredWorkspaces.map(async (workspaceDirectoryName) => {
                const absolutePathToWorkspace = join(apisDirectory, RelativeFilePath.of(workspaceDirectoryName));
                if (sdkConfigWorkspaceCollector != null && (await isSdkConfigOnlyWorkspace(absolutePathToWorkspace))) {
                    sdkConfigWorkspaceCollector.push({
                        absoluteFilePath: absolutePathToWorkspace,
                        workspaceName: workspaceDirectoryName
                    });
                    return;
                }
                const workspace = await loadAPIWorkspace({
                    absolutePathToWorkspace,
                    context,
                    cliVersion,
                    workspaceName: workspaceDirectoryName
                });
                if (workspace.didSucceed) {
                    apiWorkspaces.push(workspace.workspace);
                } else {
                    handleFailedWorkspaceParserResult(workspace, context.logger);
                    context.failAndThrow(undefined, undefined, { code: CliError.Code.ConfigError });
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

async function isSdkConfigOnlyWorkspace(absolutePathToWorkspace: AbsoluteFilePath): Promise<boolean> {
    const [sdkConfigExists, generatorsYmlExists, generatorsYamlExists, legacyGeneratorsExists] = await Promise.all([
        doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(SDK_CONFIG_FILENAME))),
        doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME))),
        doesPathExist(
            join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE))
        ),
        doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(LEGACY_GENERATORS_CONFIGURATION_FILENAME)))
    ]);
    return sdkConfigExists && !generatorsYmlExists && !generatorsYamlExists && !legacyGeneratorsExists;
}
