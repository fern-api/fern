import {
    APIV1Read,
    DocsV1Read,
    SDKSnippetHolder,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead
} from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { convertIrToFdrApi } from "@fern-api/register";

import { PlaygroundConfig } from "../DocsDefinitionResolver";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {}
});

export function convertIrToApiDefinition(
    ir: IntermediateRepresentation,
    apiDefinitionId: string,
    playgroundConfig?: PlaygroundConfig
): APIV1Read.ApiDefinition {
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
                    goSdk: undefined
                },
                playgroundConfig
            }),
            APIV1Read.ApiDefinitionId(apiDefinitionId),
            EMPTY_SNIPPET_HOLDER
        )
    );
}
