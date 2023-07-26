import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { convertHeader } from "./converters/convertHeader";

class GlobalHeader {
    public readonly schema: RawSchemas.HttpHeaderSchema;
    public count = 1;

    constructor(schema: RawSchemas.HttpHeaderSchema) {
        this.schema = schema;
    }

    public increment(): void {
        this.count += 1;
    }
}

export function getGlobalHeaders(openApiFile: OpenAPIFile): Record<string, RawSchemas.HttpHeaderSchema> {
    const globalHeaders: Record<string, GlobalHeader> = {};
    for (const endpoint of openApiFile.endpoints) {
        endpoint.headers.forEach((header) => {
            if (header.name === "Authorization") {
                // Authorization header will already be configured based on security schemes
            } else if (globalHeaders[header.name] != null) {
                globalHeaders[header.name]?.increment();
            } else {
                const convertedHeader = convertHeader({
                    header,
                    isPackageYml: false,
                    schemas: openApiFile.schemas,
                });
                globalHeaders[header.name] = new GlobalHeader(convertedHeader.value);
            }
        });
    }

    const result: Record<string, RawSchemas.HttpHeaderSchema> = {};
    const globalHeaderThreshold = openApiFile.endpoints.length * 0.75;
    for (const [headerName, header] of Object.entries(globalHeaders)) {
        if (header.count === openApiFile.endpoints.length) {
            result[headerName] = header.schema;
        } else if (header.count >= globalHeaderThreshold) {
            const schema = typeof header.schema === "string" ? `optional<${header.schema}>` : header.schema.type;
            if (schema.startsWith("optional")) {
                result[headerName] = header.schema;
            } else {
                result[headerName] =
                    typeof header.schema === "string"
                        ? `optional<${header.schema}>`
                        : { ...header.schema, type: `optional<${header.schema.type}>` };
            }
        }
    }

    return result;
}
