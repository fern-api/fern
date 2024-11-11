import { dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/api";

export interface TestCase {
    description: string;
    giveRequest: DynamicSnippets.EndpointSnippetRequest;
}
