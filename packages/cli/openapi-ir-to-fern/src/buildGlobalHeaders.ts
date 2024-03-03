import { RelativeFilePath } from "@fern-api/fs-utils";
import { ROOT_API_FILENAME } from "@fern-api/project-configuration";
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
    const predefinedGlobalHeaders = new Map(context.ir.globalHeaders?.map((header) => [header.header, header]));

    const globalHeaders: Record<string, HeaderWithCount> = {};
    for (const endpoint of context.ir.endpoints) {
        for (const header of endpoint.headers) {
            if (HEADERS_TO_IGNORE.has(header.name)) {
                continue;
            }
            let headerWithCount = globalHeaders[header.name];
            if (headerWithCount == null) {
                const predefinedHeader = predefinedGlobalHeaders.get(header.name);
                const convertedHeader = buildHeader({
                    header: {
                        ...header,
                        schema: predefinedHeader?.schema ?? header.schema,
                        name: predefinedHeader?.name ?? header.name,
                    },
                    fileContainingReference: RelativeFilePath.of(ROOT_API_FILENAME),
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
        const predefinedHeader = predefinedGlobalHeaders.get(headerName);
        let isRequired = header.count === context.ir.endpoints.length;
        const isOptional = header.count >= globalHeaderThreshold;
        if (predefinedHeader != null) {
            isRequired = (isRequired && predefinedHeader.optional !== true) || predefinedHeader.optional === false;
            let schema: RawSchemas.HttpHeaderSchema;
            if (typeof header.schema === "string") {
                schema = header.schema;
            } else {
                schema = {
                    ...header.schema,
                    env: predefinedHeader.env ?? header.schema.env
                };
            }
            context.builder.addGlobalHeader({
                name: headerName,
                schema: isRequired ? schema : wrapTypeReferenceAsOptional(schema)
            });
        } else if (isRequired) {
            context.builder.addGlobalHeader({
                name: headerName,
                schema: header.schema
            });
        } else if (isOptional) {
            context.builder.addGlobalHeader({
                name: headerName,
                schema: wrapTypeReferenceAsOptional(header.schema)
            });
        }
    }
}
