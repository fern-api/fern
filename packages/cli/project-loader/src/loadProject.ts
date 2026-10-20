import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import {
    APIS_DIRECTORY,
    ASYNCAPI_DIRECTORY,
    DEFINITION_DIRECTORY,
    DOCS_CONFIGURATION_FILENAME,
    FERN_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml,
    getFernDirectory,
    loadProjectConfig,
    OPENAPI_DIRECTORY
} from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    ApiFolderSelection,
    detectProjectDir,
    getDocsApiSectionsWithInlineSpecs,
    isSdkConfigOnly,
    ProjectDir,
    rootOwnsSdkConfig,
    selectApiFolders,
    shouldLoadApiWorkspaces,
    WorkspaceDir
} from "@fern-api/project-structure";
import { CliError, TaskContext } from "@fern-api/task-context";
import { handleFailedWorkspaceParserResult, loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";

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
    const projectDir = await detectProjectDir(absolutePathToFernDirectory);
    const docsWorkspaces = await loadDocsWorkspace({ fernDirectory: absolutePathToFernDirectory, context });
    const docsHaveInlineSpecs =
        docsWorkspaces != null && getDocsApiSectionsWithInlineSpecs(docsWorkspaces.config.navigation).length > 0;

    const loaded = shouldLoadApiWorkspaces({ project: projectDir, docsHaveInlineSpecs, skipApiWorkspaces })
        ? await loadApiWorkspaces({
              project: projectDir,
              cliName,
              cliVersion,
              context,
              commandLineApiWorkspace,
              defaultToAllApiWorkspaces,
              collectSdkConfigWorkspaces: true,
              skipLegacyWorkspaceLoading: skipApiWorkspaces
          })
        : { apiWorkspaces: [], sdkConfigWorkspaces: [] };
    const { apiWorkspaces } = loaded;
    const sdkConfigWorkspaces = [...loaded.sdkConfigWorkspaces];

    if (
        rootOwnsSdkConfig({
            project: projectDir,
            apiRequested: commandLineApiWorkspace != null,
            skipApiWorkspaces,
            loadedApiCount: apiWorkspaces.length,
            sdkConfigOwnerCount: sdkConfigWorkspaces.length
        })
    ) {
        sdkConfigWorkspaces.push({ absoluteFilePath: absolutePathToFernDirectory, workspaceName: undefined });
    }

    if (
        apiWorkspaces.length === 0 &&
        sdkConfigWorkspaces.length === 0 &&
        docsWorkspaces == null &&
        !skipApiWorkspaces &&
        projectDir.root.sdkConfigFile == null
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
    sdkConfigWorkspaceCollector,
    skipLegacyWorkspaceLoading = false
}: {
    cliName: string;
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    commandLineApiWorkspace: string | string[] | undefined;
    defaultToAllApiWorkspaces: boolean;
    /** Collect SDK Config owners, including selected owners whose legacy parsing is explicitly skipped. */
    sdkConfigWorkspaceCollector?: SdkConfigWorkspace[];
    /** Discover selected API owners without parsing legacy specifications or generators. */
    skipLegacyWorkspaceLoading?: boolean;
}): Promise<AbstractAPIWorkspace<unknown>[]> {
    const loaded = await loadApiWorkspaces({
        project: await detectProjectDir(fernDirectory),
        cliName,
        cliVersion,
        context,
        commandLineApiWorkspace,
        defaultToAllApiWorkspaces,
        collectSdkConfigWorkspaces: sdkConfigWorkspaceCollector != null,
        skipLegacyWorkspaceLoading
    });
    sdkConfigWorkspaceCollector?.push(...loaded.sdkConfigWorkspaces);
    return loaded.apiWorkspaces;
}

interface LoadedApiWorkspaces {
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    sdkConfigWorkspaces: SdkConfigWorkspace[];
}

/** What loading one workspace folder produced: an API workspace, an SDK Config owner, or nothing. */
interface LoadedFolder {
    apiWorkspace?: AbstractAPIWorkspace<unknown>;
    sdkConfigWorkspace?: SdkConfigWorkspace;
}

async function loadApiWorkspaces({
    project,
    cliName,
    cliVersion,
    context,
    commandLineApiWorkspace,
    defaultToAllApiWorkspaces,
    collectSdkConfigWorkspaces,
    skipLegacyWorkspaceLoading
}: {
    project: ProjectDir;
    cliName: string;
    cliVersion: string;
    context: TaskContext;
    commandLineApiWorkspace: string | string[] | undefined;
    defaultToAllApiWorkspaces: boolean;
    /** Whether a folder configured by an sdk-config.yml alone is an SDK Config owner instead of an API to load. */
    collectSdkConfigWorkspaces: boolean;
    skipLegacyWorkspaceLoading: boolean;
}): Promise<LoadedApiWorkspaces> {
    /**
     * A folder in `apis/` must load, and is an SDK Config owner when an sdk-config.yml is all it has. The fern
     * directory itself is optional, and is never classified that way: it is loaded, and a failure is only reported.
     */
    const load = async ({
        dir,
        workspaceName,
        isApiFolder
    }: {
        dir: WorkspaceDir;
        workspaceName: string | undefined;
        isApiFolder: boolean;
    }): Promise<LoadedFolder> => {
        if (skipLegacyWorkspaceLoading || (isApiFolder && collectSdkConfigWorkspaces && isSdkConfigOnly(dir))) {
            return { sdkConfigWorkspace: { absoluteFilePath: dir.path, workspaceName } };
        }
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: dir.path,
            context,
            cliVersion,
            workspaceName
        });
        if (workspace.didSucceed) {
            return { apiWorkspace: workspace.workspace };
        }
        handleFailedWorkspaceParserResult(workspace, context.logger);
        return isApiFolder ? context.failAndThrow(undefined, undefined, { code: CliError.Code.ConfigError }) : {};
    };

    let loadedFolders: LoadedFolder[];
    if (project.apis == null) {
        loadedFolders = [await load({ dir: project.root, workspaceName: undefined, isApiFolder: false })];
    } else {
        const selection = selectApiFolders({
            available: project.apis.map((api) => api.name),
            requested: commandLineApiWorkspace,
            defaultToAll: defaultToAllApiWorkspaces
        });
        if (selection.type !== "selected") {
            return failApiSelection({ selection, cliName, context });
        }
        const selectedNames = selection.names;
        loadedFolders = await Promise.all(
            project.apis
                .filter((api) => selectedNames.includes(api.name))
                .map((api) => load({ dir: api.dir, workspaceName: api.name, isApiFolder: true }))
        );
    }

    return {
        apiWorkspaces: loadedFolders.flatMap(({ apiWorkspace }) => (apiWorkspace != null ? [apiWorkspace] : [])),
        sdkConfigWorkspaces: loadedFolders.flatMap(({ sdkConfigWorkspace }) =>
            sdkConfigWorkspace != null ? [sdkConfigWorkspace] : []
        )
    };
}

function failApiSelection({
    selection,
    cliName,
    context
}: {
    selection: Exclude<ApiFolderSelection, { type: "selected" }>;
    cliName: string;
    context: TaskContext;
}): never {
    switch (selection.type) {
        case "unknown":
            return context.failAndThrow(
                selection.names.length === 1
                    ? `API does not exist: ${selection.names[0]}`
                    : `APIs do not exist: ${selection.names.join(", ")}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        case "none-found":
            return context.failAndThrow("No APIs found.", undefined, { code: CliError.Code.ConfigError });
        case "ambiguous": {
            const longestName = Math.max(...selection.available.map((name) => name.length));
            const suggestions = selection.available.map((name) => {
                const suggestedCommand = `${cliName} ${process.argv.slice(2).join(" ")} --api ${name}`;
                return ` › ${chalk.bold(name.padEnd(longestName))}  ${chalk.dim(suggestedCommand)}`;
            });
            return context.failAndThrow(
                `There are multiple workspaces. You must specify one with --api:\n${suggestions.join("\n")}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        default:
            assertNever(selection);
    }
}
