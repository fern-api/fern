import { FernRegistry } from "@fern-fern/registry";

export type ParsedPath = ParsedEndpointPath | ParsedTypePath;

export interface ParsedEndpointPath {
    type: "endpoint";
    environmentId: FernRegistry.EnvironmentId;
    endpoint: FernRegistry.EndpointDefinition;
}

export interface ParsedTypePath {
    type: "type";
    environmentId: FernRegistry.EnvironmentId;
    typeDefinition: FernRegistry.TypeDefinition;
}
