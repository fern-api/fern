import {
    APIV1Read,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    FdrAPI,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { PlaygroundConfig } from "../DocsDefinitionResolver";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {}
});

export function convertIrToApiDefinition({
    ir,
    apiDefinitionId,
    playgroundConfig,
    context,
    graphqlOperations = {},
    graphqlTypes = {}
}: {
    ir: IntermediateRepresentation;
    apiDefinitionId: string;
    playgroundConfig?: PlaygroundConfig;
    context: TaskContext;
    graphqlOperations?: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation>;
    graphqlTypes?: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition>;
}): APIV1Read.ApiDefinition {
    // the navigation constructor doesn't need to know about snippets, so we can pass an empty object
    return convertDbAPIDefinitionToRead(
        convertAPIDefinitionToDb(
            convertIrToFdrApi({
                ir,
                snippetsConfig: {
                    typescriptSdk: undefined,
                    pythonSdk: undefined,
                    javaSdk: undefined,
                    rubySdk: undefined,
                    goSdk: undefined,
                    csharpSdk: undefined,
                    phpSdk: undefined,
                    swiftSdk: undefined,
                    rustSdk: undefined
                },
                playgroundConfig,
                graphqlOperations,
                graphqlTypes,
                context
            }),
            APIV1Read.ApiDefinitionId(apiDefinitionId),
            EMPTY_SNIPPET_HOLDER
        )
    );
}
