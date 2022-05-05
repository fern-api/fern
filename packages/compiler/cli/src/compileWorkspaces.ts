import findUp from "find-up";
import { readFile } from "fs/promises";
import glob from "glob-promise";
import Listr from "listr";
import { createCompileWorkspaceTask } from "./compileWorkspace";

const PROJECT_CONFIG_FILENAME = "fern.config.json";

export async function compileWorkspaces(workspaces: readonly string[]): Promise<void> {
    const workspaceDefinitionPaths = await collectWorkspaceDefinitions(workspaces);
    const uniqueWorkspaceDefinitionPaths = uniq(workspaceDefinitionPaths);
    const tasks = new Listr(await Promise.all(uniqueWorkspaceDefinitionPaths.map(createCompileWorkspaceTask)), {
        concurrent: true,
    });
    await tasks.run();
}

async function collectWorkspaceDefinitions(workspaces: readonly string[]): Promise<readonly string[]> {
    if (workspaces.length > 0) {
        return workspaces;
    }

    const pathToProjectConfig = await findUp(PROJECT_CONFIG_FILENAME);
    if (pathToProjectConfig == null) {
        throw new Error(
            `No project configuration found (${PROJECT_CONFIG_FILENAME}).` +
                " If you're running fern-api from outside a project, you must manually specify the workspace(s) with --workspace."
        );
    }

    const projectConfig = await readFile(pathToProjectConfig);
    const workspacesGlobs = JSON.parse(projectConfig.toString()).workspaces;
    const allWorkspaces: string[] = [];
    for (const workspacesGlob of workspacesGlobs) {
        const workspacesInGlob = await findWorkspaceDefinitionsFromGlob(workspacesGlob);
        allWorkspaces.push(...workspacesInGlob);
    }
    return allWorkspaces;
}

async function findWorkspaceDefinitionsFromGlob(findWorkspaceDefinitionsFromGlob: string): Promise<string[]> {
    return glob(`${findWorkspaceDefinitionsFromGlob}/.fernrc.yml`, {
        absolute: true,
    });
}

function uniq<T>(items: readonly T[]): T[] {
    const uniqueItems: T[] = [];
    const seen = new Set<T>();

    for (const item of items) {
        if (!seen.has(item)) {
            uniqueItems.push(item);
        }
        seen.add(item);
    }

    return uniqueItems;
}
