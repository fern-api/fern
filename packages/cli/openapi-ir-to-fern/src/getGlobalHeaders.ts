import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { convertHeader } from "./converters/convertHeader";

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
            endpoint.headers.forEach((header) => {
                if (header.name === "Authorization") {
                    // Authorization header will already be configured based on security schemes
                } else {
                    const convertedHeader = convertHeader({
                        header,
                        isPackageYml: false,
                        schemas: openApiFile.schemas,
                    });
                    globalHeaders[header.name] = convertedHeader.value;
                }
            });
            visitedFirstEndpoint = true;
        }
    }
    return globalHeaders;
}
