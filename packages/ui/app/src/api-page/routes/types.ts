import { FernRegistry } from "@fern-fern/registry";
import { ParsedEnvironmentId } from "./useCurrentEnvironment";

export type ParsedDefinitionPath = ParsedEndpointPath | ParsedTypePath;

export interface ParsedEndpointPath {
    type: "endpoint";
    environmentId: ParsedEnvironmentId;
    endpoint: FernRegistry.EndpointDefinition;
}

export interface ParsedTypePath {
    type: "type";
    environmentId: ParsedEnvironmentId;
    typeDefinition: FernRegistry.TypeDefinition;
}
