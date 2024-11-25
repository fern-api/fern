import { dynamic } from "@fern-api/dynamic-ir-sdk/api";

export type Request = Partial<Omit<dynamic.EndpointSnippetRequest, "endpoint">>;
