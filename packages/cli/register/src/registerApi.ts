import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

import { PlaygroundConfig } from "./ir-to-fdr-converter/convertAuth";
import { convertIrToFdrApi } from "./ir-to-fdr-converter/convertIrToFdrApi";

export async function registerApi({
    organization,
    workspace,
    context,
    token,
    audiences,
    snippetsConfig,
    playgroundConfig
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
    snippetsConfig: FdrCjsSdk.api.v1.register.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
}): Promise<{ id: FdrCjsSdk.ApiDefinitionId; ir: IntermediateRepresentation }> {
    const ir = generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        disableExamples: false,
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, workspace)
    });

    const fdrService = createFdrService({
        token: token.value
    });

    const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig, playgroundConfig });
    context.logger.debug("Calling registerAPI... ", JSON.stringify(apiDefinition, undefined, 4));
    const response = await fdrService.api.v1.register.registerApiDefinition({
        orgId: FdrCjsSdk.OrgId(organization),
        apiId: FdrCjsSdk.ApiId(ir.apiName.originalName),
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
