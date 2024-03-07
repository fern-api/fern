import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { parseAsyncAPI } from "../asyncapi/parse";
import { AsyncAPIV2 } from "../asyncapi/v2";
import { loadOpenAPI } from "../loadOpenAPI";
import { generateIr as generateIrFromV2 } from "./v2/generateIr";
import { generateIr as generateIrFromV3 } from "./v3/generateIr";

export interface Spec {
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
}

export interface RawOpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface RawAsyncAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export async function parse({
    workspace,
    taskContext
}: {
    workspace: {
        specs: Spec[];
    };
    taskContext: TaskContext;
}): Promise<OpenApiIntermediateRepresentation> {
    let ir: OpenApiIntermediateRepresentation = {
        title: undefined,
        description: undefined,
        servers: [],
        tags: {
            tagsById: {},
            orderedTagIds: []
        },
        hasEndpointsMarkedInternal: false,
        endpoints: [],
        webhooks: [],
        channel: [],
        schemas: {},
        errors: {},
        variables: {},
        nonRequestReferencedSchemas: new Set(),
        securitySchemes: {},
        globalHeaders: []
    };

    for (const spec of workspace.specs) {
        const contents = (await readFile(spec.absoluteFilepath)).toString();
        if (contents.includes("openapi")) {
            const openApiDocument = await loadOpenAPI({
                absolutePathToOpenAPI: spec.absoluteFilepath,
                context: taskContext,
                absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides
            });
            if (isOpenApiV3(openApiDocument)) {
                const openapiIr = generateIrFromV3({
                    openApi: openApiDocument,
                    taskContext,
                    disableExamples: false
                });
                ir = merge(ir, openapiIr);
            } else if (isOpenApiV2(openApiDocument)) {
                const openapiIr = await generateIrFromV2({
                    openApi: openApiDocument,
                    taskContext,
                    disableExamples: false
                });
                ir = merge(ir, openapiIr);
            }
            // is openapi file
        } else if (contents.includes("asyncapi")) {
            const asyncAPI = await loadAsyncAPI(spec.absoluteFilepath);
            const parsedAsyncAPI = parseAsyncAPI({ document: asyncAPI, taskContext });
            if (parsedAsyncAPI.channel != null) {
                ir.channel.push(parsedAsyncAPI.channel);
            }
            if (parsedAsyncAPI.schemas != null) {
                ir.schemas = {
                    ...ir.schemas,
                    ...parsedAsyncAPI.schemas
                };
            }
        } else {
            taskContext.failAndThrow(`${spec.absoluteFilepath} is not a valid OpenAPI or AsyncAPI file`);
        }
    }

    return ir;
}

function merge(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation
): OpenApiIntermediateRepresentation {
    return {
        title: ir1.title ?? ir2.title,
        description: ir1.description ?? ir2.description,
        servers: [...ir1.servers, ...ir2.servers],
        tags: {
            tagsById: {
                ...ir1.tags.tagsById,
                ...ir2.tags.tagsById
            },
            orderedTagIds: [...(ir1.tags.orderedTagIds ?? []), ...(ir2.tags.orderedTagIds ?? [])]
        },
        hasEndpointsMarkedInternal: ir1.hasEndpointsMarkedInternal || ir2.hasEndpointsMarkedInternal,
        endpoints: [...ir1.endpoints, ...ir2.endpoints],
        webhooks: [...ir1.webhooks, ...ir2.webhooks],
        channel: [...ir1.channel, ...ir2.channel],
        schemas: {
            ...ir1.schemas,
            ...ir2.schemas
        },
        errors: {
            ...ir1.errors,
            ...ir2.errors
        },
        variables: {
            ...ir1.variables,
            ...ir2.variables
        },
        nonRequestReferencedSchemas: new Set([...ir1.nonRequestReferencedSchemas, ...ir2.nonRequestReferencedSchemas]),
        securitySchemes: {
            ...ir1.securitySchemes,
            ...ir2.securitySchemes
        },
        globalHeaders: ir1.globalHeaders != null ? [...ir1.globalHeaders, ...(ir2.globalHeaders ?? [])] : undefined
    };
}

async function loadAsyncAPI(absoluteFilePathToAsyncAPI: AbsoluteFilePath): Promise<AsyncAPIV2.Document> {
    const contents = (await readFile(absoluteFilePathToAsyncAPI)).toString();
    return (await yaml.load(contents)) as AsyncAPIV2.Document;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
