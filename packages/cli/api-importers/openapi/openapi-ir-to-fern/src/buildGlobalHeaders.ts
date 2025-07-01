import { camelCase } from "lodash-es";

import { ROOT_API_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { GlobalHeader } from "@fern-api/openapi-ir";
import { RelativeFilePath, join } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { buildHeader } from "./buildHeader";
import { buildTypeReference } from "./buildTypeReference";
import { getGroupNameForSchema } from "./utils/getGroupNameForSchema";
import { getNamespaceFromGroup } from "./utils/getNamespaceFromGroup";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";
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

const HEADERS_TO_IGNORE = new Set(...["authorization"]);

export function buildGlobalHeaders(context: OpenApiIrConverterContext): void {
    if (context.globalHeaderOverrides != null) {
        for (const [name, declaration] of Object.entries(context.globalHeaderOverrides.headers ?? {})) {
            context.builder.addGlobalHeader({
                name,
                schema: declaration
            });
        }
        return;
    }

    const predefinedGlobalHeaders: Record<string, GlobalHeader> = Object.fromEntries(
        (context.ir.globalHeaders ?? []).map((header) => [header.header, header])
    );

    for (const [headerName, header] of Object.entries(predefinedGlobalHeaders)) {
        let schema: RawSchemas.HttpHeaderSchema = "optional<string>";

        if (header.name == null && header.env == null && typeof header.schema === "string") {
            schema = header.schema;
        } else if (header != null) {
            const groupName = header.schema ? getGroupNameForSchema(header.schema) : undefined;
            const namespace = groupName != null ? getNamespaceFromGroup(groupName) : undefined;
            const defaultFile = RelativeFilePath.of("api.yml");
            schema = {
                name: header.name,
                env: header.env,
                type:
                    header.schema != null
                        ? (getTypeFromTypeReference(
                              buildTypeReference({
                                  schema: header.schema,
                                  context,
                                  fileContainingReference: namespace
                                      ? join(RelativeFilePath.of(camelCase(namespace)), defaultFile)
                                      : defaultFile,
                                  namespace,
                                  declarationDepth: 0
                              })
                          ) ?? "optional<string>")
                        : "optional<string>"
            };
        }
        context.builder.addGlobalHeader({
            name: headerName,
            schema
        });
    }

    if (context.detectGlobalHeaders) {
        const globalHeaders: Record<string, HeaderWithCount> = {};
        for (const endpoint of context.ir.endpoints) {
            for (const header of endpoint.headers) {
                if (HEADERS_TO_IGNORE.has(header.name.toLowerCase())) {
                    continue;
                }
                let headerWithCount = globalHeaders[header.name];
                if (headerWithCount == null) {
                    const predefinedHeader = predefinedGlobalHeaders[header.name];
                    const convertedHeader = buildHeader({
                        header: {
                            ...header,
                            schema: predefinedHeader?.schema ?? header.schema,
                            name: predefinedHeader?.name ?? header.name
                        },
                        fileContainingReference: RelativeFilePath.of(ROOT_API_FILENAME),
                        context,
                        // TODO: how are we namespacing global headers
                        namespace: undefined
                    });
                    headerWithCount = new HeaderWithCount(convertedHeader);
                    globalHeaders[header.name] = headerWithCount;
                }
                headerWithCount.increment();
            }
        }

        const globalHeaderThreshold = context.ir.endpoints.length * GLOBAL_HEADER_PERCENTAGE_THRESHOLD;

        for (const [headerName, header] of Object.entries(globalHeaders)) {
            const predefinedHeader = predefinedGlobalHeaders[headerName];
            const isRequired = header.count === context.ir.endpoints.length;
            const isOptional = header.count >= globalHeaderThreshold;
            if (predefinedHeader != null) {
                continue; // already added
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
}
