import { assertNever } from "@fern-api/core-utils";
import { OpenApiIntermediateRepresentation, Schemas, Source as OpenApiIrSource } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { DEFAULT_PARSE_ASYNCAPI_SETTINGS, ParseAsyncAPIOptions } from "./asyncapi/options";
import { parseAsyncAPI } from "./asyncapi/parse";
import { AsyncAPIV2 } from "./asyncapi/v2";
import { generateIr as generateIrFromV2 } from "./openapi/v2/generateIr";
import { generateIr as generateIrFromV3 } from "./openapi/v3/generateIr";
import { getParseOptions, ParseOpenAPIOptions } from "./options";

export type Document = OpenAPIDocument | AsyncAPIDocument;

export interface OpenAPIDocument {
    type: "openapi";
    value: OpenAPI.Document;
    source?: OpenApiIrSource;
    namespace?: string;
    settings?: ParseOpenAPIOptions;
}

export interface AsyncAPIDocument {
    type: "asyncapi";
    value: AsyncAPIV2.Document;
    source?: OpenApiIrSource;
    namespace?: string;
    settings?: ParseOpenAPIOptions;
}

export async function parse({
    context,
    documents,
    options
}: {
    context: TaskContext;
    documents: Document[];
    options?: Partial<ParseOpenAPIOptions>;
}): Promise<OpenApiIntermediateRepresentation> {
    let ir: OpenApiIntermediateRepresentation = {
        apiVersion: undefined,
        title: undefined,
        description: undefined,
        basePath: undefined,
        servers: [],
        tags: {
            tagsById: {},
            orderedTagIds: undefined
        },
        hasEndpointsMarkedInternal: false,
        endpoints: [],
        webhooks: [],
        channel: [],
        groupedSchemas: {
            rootSchemas: {},
            namespacedSchemas: {}
        },
        variables: {},
        nonRequestReferencedSchemas: new Set(),
        securitySchemes: {},
        globalHeaders: [],
        idempotencyHeaders: [],
        groups: {}
    };
    for (const document of documents) {
        const source = document.source != null ? document.source : OpenApiIrSource.openapi({ file: "<memory>" });
        switch (document.type) {
            case "openapi": {
                if (isOpenApiV3(document.value)) {
                    const openapiIr = generateIrFromV3({
                        taskContext: context,
                        openApi: document.value,
                        options: getParseOptions({ options: document.settings, overrides: options }),
                        source,
                        namespace: document.namespace
                    });
                    ir = merge(ir, openapiIr);
                } else if (isOpenApiV2(document.value)) {
                    const openapiIr = await generateIrFromV2({
                        taskContext: context,
                        openApi: document.value,
                        options: getParseOptions({ options: document.settings, overrides: options }),
                        source,
                        namespace: document.namespace
                    });
                    ir = merge(ir, openapiIr);
                }
                break;
            }
            case "asyncapi": {
                const parsedAsyncAPI = parseAsyncAPI({
                    document: document.value,
                    taskContext: context,
                    options: getParseOptions({ options: document.settings, overrides: options }),
                    source,
                    asyncApiOptions: getParseAsyncOptions({ options: document.settings }),
                    namespace: document.namespace
                });
                if (parsedAsyncAPI.channel != null) {
                    ir.channel.push(parsedAsyncAPI.channel);
                }
                if (parsedAsyncAPI.groupedSchemas != null) {
                    ir.groupedSchemas = mergeSchemaMaps(ir.groupedSchemas, parsedAsyncAPI.groupedSchemas);
                }
                if (parsedAsyncAPI.basePath != null) {
                    ir.basePath = parsedAsyncAPI.basePath;
                }
                break;
            }
            default:
                assertNever(document);
        }
    }
    return ir;
}

function getParseAsyncOptions({
    options,
    overrides
}: {
    options?: ParseOpenAPIOptions;
    overrides?: Partial<ParseAsyncAPIOptions>;
}): ParseAsyncAPIOptions {
    return {
        naming: overrides?.naming ?? options?.asyncApiNaming ?? DEFAULT_PARSE_ASYNCAPI_SETTINGS.naming
    };
}

function merge(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation
): OpenApiIntermediateRepresentation {
    return {
        apiVersion: ir1.apiVersion ?? ir2.apiVersion,
        title: ir1.title ?? ir2.title,
        description: ir1.description ?? ir2.description,
        basePath: ir1.basePath ?? ir2.basePath,
        servers: [...ir1.servers, ...ir2.servers],
        tags: {
            tagsById: {
                ...ir1.tags.tagsById,
                ...ir2.tags.tagsById
            },
            orderedTagIds:
                ir1.tags.orderedTagIds == null && ir2.tags.orderedTagIds == null
                    ? undefined
                    : [...(ir1.tags.orderedTagIds ?? []), ...(ir2.tags.orderedTagIds ?? [])]
        },
        hasEndpointsMarkedInternal: ir1.hasEndpointsMarkedInternal || ir2.hasEndpointsMarkedInternal,
        endpoints: [...ir1.endpoints, ...ir2.endpoints],
        webhooks: [...ir1.webhooks, ...ir2.webhooks],
        channel: [...ir1.channel, ...ir2.channel],
        groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas),
        variables: {
            ...ir1.variables,
            ...ir2.variables
        },
        nonRequestReferencedSchemas: new Set([...ir1.nonRequestReferencedSchemas, ...ir2.nonRequestReferencedSchemas]),
        securitySchemes: {
            ...ir1.securitySchemes,
            ...ir2.securitySchemes
        },
        globalHeaders: ir1.globalHeaders != null ? [...ir1.globalHeaders, ...(ir2.globalHeaders ?? [])] : undefined,
        idempotencyHeaders:
            ir1.idempotencyHeaders != null ? [...ir1.idempotencyHeaders, ...(ir2.idempotencyHeaders ?? [])] : undefined,
        groups: {
            ...ir1.groups,
            ...ir2.groups
        }
    };
}

function mergeSchemaMaps(schemas1: Schemas, schemas2: Schemas): Schemas {
    schemas1.rootSchemas = { ...schemas1.rootSchemas, ...schemas2.rootSchemas };

    for (const [namespace, namespaceSchemas] of Object.entries(schemas2.namespacedSchemas)) {
        // If both share the namespace, merge the schemas within that namespace
        if (schemas1.namespacedSchemas[namespace] != null) {
            schemas1.namespacedSchemas[namespace] = { ...schemas1.namespacedSchemas[namespace], ...namespaceSchemas };
        } else {
            // Otherwise, just add the namespace to the schemas
            schemas1.namespacedSchemas[namespace] = namespaceSchemas;
        }
    }

    return schemas1;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
