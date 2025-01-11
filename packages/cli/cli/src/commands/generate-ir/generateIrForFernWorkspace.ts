import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, generatorsYml } from "@fern-api/configuration-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

export async function generateIrForFernWorkspace({
    workspace,
    context,
    generationLanguage,
    keywords,
    smartCasing,
    disableExamples,
    audiences,
    readme
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    disableExamples: boolean;
    audiences: Audiences;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<IntermediateRepresentation> {
    await validateAPIWorkspaceAndLogIssues({ workspace, context, logWarnings: false });
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage,
        keywords,
        smartCasing,
        disableExamples,
        audiences,
        readme,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, workspace)
    });
}
