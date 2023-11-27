import { RawSchemas } from "@fern-api/yaml-schema";

export function getFullEndpointPath({
    service,
    endpoint
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
}): string {
    return service["base-path"] + endpoint.path;
}
