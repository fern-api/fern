import { FernToken } from "@fern-api/auth";
import { Audiences } from "@fern-api/config-management-commons";
import { createFdrService } from "@fern-api/core";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernRegistry } from "@fern-fern/registry-node";
import { convertIrToFdrApi } from "./ir-to-fdr-converter/convertIrToFdrApi";

export async function registerApi({
    organization,
    workspace,
    context,
    token,
    audiences,
    snippetsConfig,
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
    snippetsConfig: FernRegistry.api.v1.register.SnippetsConfig;
}): Promise<FernRegistry.ApiDefinitionId> {
    const ir = await generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: undefined,
    });

    const fdrService = createFdrService({
        token: token.value,
    });

    const apiDefinition = convertIrToFdrApi(ir, snippetsConfig);
    context.logger.debug("Calling registerAPI... ", JSON.stringify(apiDefinition, undefined, 4));
    const response = await fdrService.api.v1.register.registerApiDefinition({
        orgId: FernRegistry.OrgId(organization),
        apiId: FernRegistry.ApiId(ir.apiName.originalName),
        definition: apiDefinition,
    });

    if (response.ok) {
        context.logger.debug(`Registered API Definition ${response.body.apiDefinitionId}`);
        return response.body.apiDefinitionId;
    } else {
        return response.error._visit<never>({
            unauthorizedError: () => {
                return context.failAndThrow("Insufficient permissions.");
            },
            userNotInOrgError: () => {
                return context.failAndThrow("Insufficient permissions.");
            },
            _other: (error) => {
                return context.failAndThrow("Failed to register API", error);
            },
        });
    }
}
