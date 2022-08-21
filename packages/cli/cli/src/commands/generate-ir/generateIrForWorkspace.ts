import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { CliContext } from "../../cli-context/CliContext";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export async function generateIrForWorkspace({
    workspace,
    cliContext,
}: {
    workspace: Workspace;
    cliContext: CliContext;
}): Promise<IntermediateRepresentation> {
    await validateWorkspaceAndLogIssues(workspace, cliContext);
    return generateIntermediateRepresentation(workspace);
}
