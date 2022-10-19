import { generateIntermediateRepresentation, Language } from "@fern-api/ir-generator";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export async function generateIrForWorkspace({
    workspace,
    context,
    generationLanguage,
}: {
    workspace: Workspace;
    context: TaskContext;
    generationLanguage: Language | undefined;
}): Promise<IntermediateRepresentation> {
    await validateWorkspaceAndLogIssues(workspace, context);
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage,
    });
}
