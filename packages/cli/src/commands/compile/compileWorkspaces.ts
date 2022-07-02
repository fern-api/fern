import { loadProjectConfig, ProjectConfig } from "@fern-api/commons";
import { writeFile } from "fs/promises";
import path from "path";
import { getUniqueWorkspaces } from "../utils/getUniqueWorkspaces";
import { compileAndGenerateWorkspace, compileWorkspace } from "./compileWorkspace";

export const IR_FILENAME = "ir.json";

export async function compileWorkspaces({
    commandLineWorkspaces,
    writeIr,
}: {
    commandLineWorkspaces: readonly string[];
    writeIr: boolean;
}): Promise<void> {
    const { uniqueWorkspaceDefinitionPaths } = await loadProjectAndUniqueWorkspaces(commandLineWorkspaces);
    await Promise.all(
        uniqueWorkspaceDefinitionPaths.map(async (uniqueWorkspaceDefinitionPath) => {
            const { compileResult, workspaceDefinition } = await compileWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
            });
            if (!compileResult.didSucceed) {
                console.log("%s: failed to compile API Definition", workspaceDefinition.name);
            } else if (writeIr) {
                const workspaceDirectory = path.dirname(uniqueWorkspaceDefinitionPath);
                const irOutputFilePath = path.join(workspaceDirectory, IR_FILENAME);
                console.log(irOutputFilePath);
                await writeFile(
                    irOutputFilePath,
                    JSON.stringify(compileResult.intermediateRepresentation, undefined, 4)
                );
                console.log("%s: wrote IR", workspaceDefinition.name);
            }
        })
    );
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
