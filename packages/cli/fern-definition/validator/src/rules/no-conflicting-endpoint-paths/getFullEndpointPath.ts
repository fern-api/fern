import { RawSchemas } from "@fern-api/fern-definition-schema";

export function getFullEndpointPath({
    service,
    endpoint
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
}): string {
    return service["base-path"] + endpoint.path;
}
