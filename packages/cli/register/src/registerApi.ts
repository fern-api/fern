import { FernToken } from "@fern-api/auth";
import { Audiences } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { APIV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { convertIrToFdrApi } from "./ir-to-fdr-converter/convertIrToFdrApi";

export async function registerApi({
    organization,
    workspace,
    context,
    token,
    audiences,
    snippetsConfig
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
    snippetsConfig: APIV1Write.SnippetsConfig;
}): Promise<{ id: FdrAPI.ApiDefinitionId; ir: IntermediateRepresentation }> {
    const ir = await generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        disableExamples: false,
        readme: undefined
    });

    const fdrService = createFdrService({
        token: token.value
    });

    const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig });
    context.logger.debug("Calling registerAPI... ", JSON.stringify(apiDefinition, undefined, 4));
    const response = await fdrService.api.v1.register.registerApiDefinition({
        orgId: organization,
        apiId: ir.apiName.originalName,
        definition: apiDefinition
    });

    if (response.ok) {
        context.logger.debug(`Registered API Definition ${response.body.apiDefinitionId}`);
        return { id: response.body.apiDefinitionId, ir };
    } else {
        switch (response.error.error) {
            case "UnauthorizedError":
            case "UserNotInOrgError": {
                return context.failAndThrow(
                    "You do not have permissions to register the docs. Reach out to support@buildwithfern.com"
                );
            }
            default:
                return context.failAndThrow("Failed to register API", response.error);
        }
    }
}
