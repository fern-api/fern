import { APIS_DIRECTORY, ASYNCAPI_DIRECTORY, DEFINITION_DIRECTORY, OPENAPI_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir } from "fs/promises";

import { existsIn } from "../utils.js";
import { findGeneratorsFile, findSdkConfigFile, GeneratorsFile } from "./config-files.js";

/** What is on disk in one folder that can declare an API: the fern directory itself, or one `apis/<name>` folder. */
export interface WorkspaceDir {
    readonly path: AbsoluteFilePath;
    readonly generatorsFile: GeneratorsFile;
    readonly sdkConfigFile: AbsoluteFilePath | undefined;
    readonly hasDefinitionDirectory: boolean;
    readonly hasOpenapiDirectory: boolean;
    readonly hasAsyncapiDirectory: boolean;
}

export interface ApiFolder {
    readonly name: string;
    readonly dir: WorkspaceDir;
}

/** What is on disk in the fern directory. */
export interface ProjectDir {
    readonly path: AbsoluteFilePath;
    /** The fern directory seen as a single workspace, which is how a project with one API is laid out. */
    readonly root: WorkspaceDir;
    /** The folders inside `apis/`, or `undefined` when there is no `apis/` folder. */
    readonly apis: readonly ApiFolder[] | undefined;
}

export async function detectWorkspaceDir(path: AbsoluteFilePath): Promise<WorkspaceDir> {
    const [generatorsFile, sdkConfigFile, hasDefinitionDirectory, hasOpenapiDirectory, hasAsyncapiDirectory] =
        await Promise.all([
            findGeneratorsFile(path),
            findSdkConfigFile(path),
            existsIn(path, DEFINITION_DIRECTORY),
            existsIn(path, OPENAPI_DIRECTORY),
            existsIn(path, ASYNCAPI_DIRECTORY)
        ]);
    return { path, generatorsFile, sdkConfigFile, hasDefinitionDirectory, hasOpenapiDirectory, hasAsyncapiDirectory };
}

export async function detectProjectDir(path: AbsoluteFilePath): Promise<ProjectDir> {
    const [root, hasApisDirectory] = await Promise.all([detectWorkspaceDir(path), existsIn(path, APIS_DIRECTORY)]);
    return { path, root, apis: hasApisDirectory ? await detectApiFolders(path) : undefined };
}

async function detectApiFolders(projectPath: AbsoluteFilePath): Promise<ApiFolder[]> {
    const apisPath = join(projectPath, RelativeFilePath.of(APIS_DIRECTORY));
    const entries = await readdir(apisPath, { withFileTypes: true });
    return await Promise.all(
        entries
            .filter((entry) => entry.isDirectory())
            .map(async (entry) => ({
                name: entry.name,
                dir: await detectWorkspaceDir(join(apisPath, RelativeFilePath.of(entry.name)))
            }))
    );
}
