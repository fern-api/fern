import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { buildHeader } from "./buildHeader";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { wrapTypeReferenceAsOptional } from "./utils/wrapTypeReferenceAsOptional";

class HeaderWithCount {
    public readonly schema: RawSchemas.HttpHeaderSchema;
    public count = 0;

    constructor(schema: RawSchemas.HttpHeaderSchema) {
        this.schema = schema;
    }

    public increment(): void {
        this.count += 1;
    }
}

/* 75% of endpoints must have header present, for it to be considered a global header*/
const GLOBAL_HEADER_PERCENTAGE_THRESHOLD = 0.75;

const HEADERS_TO_IGNORE = new Set(...["Authorization"]);

export function buildGlobalHeaders(context: OpenApiIrConverterContext): void {
    const globalHeaders: Record<string, HeaderWithCount> = {};
    for (const endpoint of context.ir.endpoints) {
        for (const header of endpoint.headers) {
            if (HEADERS_TO_IGNORE.has(header.name)) {
                continue;
            }
            let headerWithCount = globalHeaders[header.name];
            if (headerWithCount == null) {
                const convertedHeader = buildHeader({
                    header,
                    fileContainingReference: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
                    context
                });
                headerWithCount = new HeaderWithCount(convertedHeader);
                globalHeaders[header.name] = headerWithCount;
            }
            headerWithCount.increment();
        }
    }

    const globalHeaderThreshold = context.ir.endpoints.length * GLOBAL_HEADER_PERCENTAGE_THRESHOLD;

    for (const [headerName, header] of Object.entries(globalHeaders)) {
        if (header.count === context.ir.endpoints.length) {
            context.builder.addGlobalHeader({
                name: headerName,
                schema: header.schema
            });
        } else if (header.count >= globalHeaderThreshold) {
            context.builder.addGlobalHeader({
                name: headerName,
                schema: wrapTypeReferenceAsOptional(header.schema)
            });
        }
    }
}
