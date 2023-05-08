import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { camelCase } from "lodash-es";
import { convertToTypeReference } from "./converters/convertToTypeReference";
import { getTypeFromTypeReference } from "./converters/utils/getTypeFromTypeReference";

export function getGlobalHeaders(openApiFile: OpenAPIFile): Record<string, RawSchemas.HttpHeaderSchema> {
    const globalHeaders: Record<string, RawSchemas.HttpHeaderSchema> = {};
    let visitedFirstEndpoint = false;
    for (const endpoint of openApiFile.endpoints) {
        const endpointHeaders = endpoint.headers;
        if (visitedFirstEndpoint) {
            for (const headerName of Object.keys(globalHeaders)) {
                if (!(headerName in endpointHeaders)) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete globalHeaders[headerName];
                }
            }
        } else {
            endpointHeaders.forEach((endpointHeader) => {
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
