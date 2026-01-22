import { APIV1Read, convertAPIDefinitionToDb, convertDbAPIDefinitionToRead, SDKSnippetHolder } from "@fern-api/fdr-sdk";
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
    workspaceName
}: {
    ir: IntermediateRepresentation;
    apiDefinitionId: string;
    playgroundConfig?: PlaygroundConfig;
    context: TaskContext;
    workspaceName?: string;
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
                context,
                workspaceName
            }),
            APIV1Read.ApiDefinitionId(apiDefinitionId),
            EMPTY_SNIPPET_HOLDER
        )
    );
}
