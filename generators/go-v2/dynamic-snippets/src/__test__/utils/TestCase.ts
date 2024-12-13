import { dynamic } from "@fern-api/dynamic-ir-sdk/api";

export interface TestCase {
    description: string;
    giveRequest: dynamic.EndpointSnippetRequest;
}
