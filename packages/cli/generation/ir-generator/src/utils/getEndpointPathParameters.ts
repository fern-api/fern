import { RawSchemas } from "@fern-api/fern-definition-schema";

export function getEndpointPathParameters(
    endpoint: RawSchemas.HttpEndpointSchema
): Record<string, RawSchemas.HttpPathParameterSchema> {
    return typeof endpoint.request !== "string" && endpoint.request?.["path-parameters"]
        ? endpoint.request?.["path-parameters"]
        : endpoint["path-parameters"] != null
          ? endpoint["path-parameters"]
          : {};
}
