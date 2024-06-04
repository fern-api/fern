import { Audiences, generatorsYml } from "@fern-api/configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

export async function generateIrForFernWorkspace({
    workspace,
    context,
    generationLanguage,
    keywords,
    smartCasing,
    casingVersion,
    disableExamples,
    audiences
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    casingVersion: generatorsYml.CasingVersion | undefined;
    disableExamples: boolean;
    audiences: Audiences;
}): Promise<IntermediateRepresentation> {
    await validateAPIWorkspaceAndLogIssues({ workspace, context, logWarnings: false });
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage,
        keywords,
        smartCasing,
        casingVersion,
        disableExamples,
        audiences
    });
}
