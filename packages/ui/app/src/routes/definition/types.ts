import { FernRegistry } from "@fern-fern/registry";

export type ParsedPath = ParsedEndpointPath | ParsedTypePath;

export interface ParsedEndpointPath {
    type: "endpoint";
    endpoint: FernRegistry.EndpointDefinition;
}

export interface ParsedTypePath {
    type: "type";
    typeDefinition: FernRegistry.TypeDefinition;
}
