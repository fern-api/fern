import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { CliError, TaskContext } from "@fern-api/task-context";

import { AIExampleEnhancerConfig, enhanceExamplesWithAI } from "./ai-example-enhancer/index.js";
import { PlaygroundConfig } from "./ir-to-fdr-converter/convertAuth.js";
import { convertIrToFdrApi } from "./ir-to-fdr-converter/convertIrToFdrApi.js";
import { getOriginalName } from "./ir-to-fdr-converter/nameUtils.js";

export async function registerApi({
    organization,
    workspace,
    context,
    token,
    audiences,
    snippetsConfig,
    playgroundConfig,
    graphqlOperations = {},
    graphqlTypes = {},
    aiEnhancerConfig
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    token: FernToken;
    audiences: Audiences;
    snippetsConfig: FdrCjsSdk.api.v1.register.SnippetsConfig;
    playgroundConfig?: PlaygroundConfig;
    graphqlOperations?: Record<FdrCjsSdk.GraphQlOperationId, FdrCjsSdk.api.v1.register.GraphQlOperation>;
    graphqlTypes?: Record<FdrCjsSdk.TypeId, FdrCjsSdk.api.v1.register.TypeDefinition>;
    aiEnhancerConfig?: AIExampleEnhancerConfig;
}): Promise<{ id: FdrCjsSdk.ApiDefinitionId; ir: IntermediateRepresentation }> {
    const ir = generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        exampleGeneration: { disabled: false },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, workspace)
    });

    const fdrService = createFdrService({
        token: token.value
    });

    let apiDefinition = convertIrToFdrApi({
        ir,
        snippetsConfig,
        playgroundConfig,
        graphqlOperations,
        graphqlTypes,
        context
    });

    if (aiEnhancerConfig) {
        const sources = workspace.getSources();
        const openApiSources = sources
            .filter((source) => source.type === "openapi")
            .map((source) => ({
                absoluteFilePath: source.absoluteFilePath,
                absoluteFilePathToOverrides: source.absoluteFilePathToOverrides
            }));

        apiDefinition = await enhanceExamplesWithAI(
            apiDefinition,
            aiEnhancerConfig,
            context,
            token,
            organization,
            openApiSources.length > 0 ? openApiSources : undefined,
            getOriginalName(ir.apiName)
        );
    }

    try {
        const response = await fdrService.api.register.registerApiDefinition({
            orgId: FdrCjsSdk.OrgId(organization),
            apiId: FdrCjsSdk.ApiId(getOriginalName(ir.apiName)),
            definition: apiDefinition
        });

        context.logger.debug(`Registered API Definition ${response.apiDefinitionId}`);
        return { id: response.apiDefinitionId, ir };
    } catch (error) {
        return context.failAndThrow("Failed to register API", error, {
            code: CliError.Code.NetworkError
        });
    }
}
