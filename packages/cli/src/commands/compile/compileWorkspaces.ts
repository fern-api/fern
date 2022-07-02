import { loadProjectConfig, ProjectConfig } from "@fern-api/commons";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { getUniqueWorkspaces } from "../utils/getUniqueWorkspaces";
import { compileAndGenerateWorkspace, compileWorkspace } from "./compileWorkspace";

const IR_FILENAME = "ir.json";

export async function compileWorkspaces({
    commandLineWorkspaces,
    writeIr,
}: {
    commandLineWorkspaces: readonly string[];
    writeIr: boolean;
}): Promise<void> {
    const { uniqueWorkspaceDefinitionPaths } = await loadProjectAndUniqueWorkspaces(commandLineWorkspaces);
    uniqueWorkspaceDefinitionPaths.map(async (uniqueWorkspaceDefinitionPath) => {
        const { compileResult, workspaceDefinition } = await compileWorkspace({
            absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
        });
        if (!compileResult.didSucceed) {
            console.log("%s: Failed to compile API Definition", workspaceDefinition.name);
        } else if (writeIr) {
            await writeFile(
                path.join(uniqueWorkspaceDefinitionPath, IR_FILENAME),
                yaml.dump(compileResult.intermediateRepresentation)
            );
            const relativeWorkspaceDefinitionPath = path.relative(uniqueWorkspaceDefinitionPath, __dirname);
            console.log("%s: Wrote IR to %s", workspaceDefinition.name, relativeWorkspaceDefinitionPath);
        }
    });
}

export async function compileAndGenerateWorkspaces({
    commandLineWorkspaces,
    runLocal,
}: {
    commandLineWorkspaces: readonly string[];
    runLocal: boolean;
}): Promise<void> {
    const { projectConfig, uniqueWorkspaceDefinitionPaths } = await loadProjectAndUniqueWorkspaces(
        commandLineWorkspaces
    );

    await Promise.all(
        uniqueWorkspaceDefinitionPaths.map((uniqueWorkspaceDefinitionPath) =>
            compileAndGenerateWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
                runLocal,
                organization: projectConfig.organization,
            })
        )
    );
}

async function loadProjectAndUniqueWorkspaces(commandLineWorkspaces: readonly string[]): Promise<{
    projectConfig: ProjectConfig;
    uniqueWorkspaceDefinitionPaths: string[];
}> {
    const projectConfig = await loadProjectConfig();

    const uniqueWorkspaceDefinitionPaths = await getUniqueWorkspaces({
        commandLineWorkspaces,
        projectConfig,
    });

    return { projectConfig, uniqueWorkspaceDefinitionPaths };
}
