import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export async function generateIrForWorkspace({
    workspace,
}: {
    workspace: Workspace;
}): Promise<IntermediateRepresentation> {
    await validateWorkspaceAndLogIssues(workspace);
    return generateIntermediateRepresentation(workspace);
}
