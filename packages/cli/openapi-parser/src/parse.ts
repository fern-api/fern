import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import { OpenAPIIntermediateRepresentation, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { AsyncAPI } from "./asyncapi";
import { generateSchemasFromAsyncAPI } from "./asyncapi/generateSchemasFromAsyncAPI";
import { loadOpenAPI } from "./loadOpenAPI";
import { generateIr as generateIrFromV2 } from "./v2/generateIr";
import { generateIr as generateIrFromV3 } from "./v3/generateIr";

export interface RawOpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface RawAsyncAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export async function parse({
    absolutePathToAsyncAPI,
    absolutePathToOpenAPI,
    absolutePathToOpenAPIOverrides,
    taskContext
}: {
    absolutePathToAsyncAPI: AbsoluteFilePath | undefined;
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
    taskContext: TaskContext;
}): Promise<OpenAPIIntermediateRepresentation> {
    let asyncAPISchemas: Record<SchemaId, Schema> = {};
    if (absolutePathToAsyncAPI != null) {
        const asyncAPI = await loadAsyncAPI(absolutePathToAsyncAPI);
        asyncAPISchemas = generateSchemasFromAsyncAPI(asyncAPI, taskContext);
    }

    const openApiDocument = await loadOpenAPI({
        absolutePathToOpenAPI,
        context: taskContext,
        absolutePathToOpenAPIOverrides
    });
    let openApiIr: OpenAPIIntermediateRepresentation | undefined = undefined;
    if (isOpenApiV3(openApiDocument)) {
        openApiIr = generateIrFromV3(openApiDocument, taskContext);
    } else if (isOpenApiV2(openApiDocument)) {
        openApiIr = await generateIrFromV2(openApiDocument, taskContext);
    }

    if (openApiIr != null) {
        return {
            ...openApiIr,
            schemas: {
                ...openApiIr.schemas,
                ...asyncAPISchemas
            }
        };
    }

    return taskContext.failAndThrow("Only OpenAPI V3 and V2 Documents are supported.");
}

async function loadAsyncAPI(absoluteFilePathToAsyncAPI: AbsoluteFilePath): Promise<AsyncAPI> {
    const contents = (await readFile(absoluteFilePathToAsyncAPI)).toString();
    return (await yaml.load(contents)) as AsyncAPI;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
