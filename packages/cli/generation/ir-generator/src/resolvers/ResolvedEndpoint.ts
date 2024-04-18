import { RawSchemas } from "@fern-api/yaml-schema";

export interface ResolvedEndpoint {
    endpointId: string;
    endpoint: RawSchemas.HttpEndpointSchema;
}
