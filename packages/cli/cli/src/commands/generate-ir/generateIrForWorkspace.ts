import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { WorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import validatePackageName from "validate-npm-package-name";
import { validateWorkspace } from "../validate/validateWorkspace";
import { handleFailedWorkspaceParserResult } from "./handleWorkspaceParserFailures";

export async function generateIrForWorkspace({
    workspaceConfiguration,
}: {
    workspaceConfiguration: WorkspaceConfiguration;
}): Promise<IntermediateRepresentation> {
    validateWorkspaceName(workspaceConfiguration.name);
    const parseResult = await loadWorkspace({
        name: workspaceConfiguration.name,
        absolutePathToDefinition: workspaceConfiguration.absolutePathToConfiguration,
    });
    if (!parseResult.didSucceed) {
        handleFailedWorkspaceParserResult(parseResult);
        throw new Error("Failed to parse workspace");
    }
    await validateWorkspace(parseResult.workspace);
    return generateIntermediateRepresentation(parseResult.workspace);
}

function validateWorkspaceName(workspaceName: string) {
    const { validForNewPackages } = validatePackageName(workspaceName);
    if (!validForNewPackages) {
        throw new Error(`Invalid workspace name: ${workspaceName}`);
    }
}
