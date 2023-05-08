import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { camelCase } from "lodash-es";
import { convertToTypeReference } from "./converters/convertToTypeReference";
import { getTypeFromTypeReference } from "./converters/utils/getTypeFromTypeReference";

export function getGlobalHeaders(openApiFile: OpenAPIFile): Record<string, RawSchemas.HttpHeaderSchema> {
    const globalHeaders: Record<string, RawSchemas.HttpHeaderSchema> = {};
    let visitedFirstEndpoint = false;
    for (const endpoint of openApiFile.endpoints) {
        if (visitedFirstEndpoint) {
            const endpointHeaderNames = new Set(
                endpoint.headers.map((endpointHeader) => {
                    return endpointHeader.name;
                })
            );
            for (const headerName of Object.keys(globalHeaders)) {
                if (!endpointHeaderNames.has(headerName)) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete globalHeaders[headerName];
                }
            }
        } else {
            endpoint.headers.forEach((endpointHeader) => {
                if (endpointHeader.name === "Authorization") {
                    // Authorization header will already be configured based on security schemes
                } else {
                    const typeReference = convertToTypeReference({
                        schema: endpointHeader.schema,
                        schemas: openApiFile.schemas,
                    });
                    const headerWithoutXPrefix = endpointHeader.name.replace(/^x-|^X-/, "");
                    globalHeaders[endpointHeader.name] = {
                        name: camelCase(headerWithoutXPrefix),
                        type: getTypeFromTypeReference(typeReference.typeReference),
                        docs: endpointHeader.description ?? undefined,
                    };
                }
            });
            visitedFirstEndpoint = true;
        }
    }
    return globalHeaders;
}
