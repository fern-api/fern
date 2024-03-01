import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { AsyncAPIIntermediateRepresentation, parseAsyncAPI } from "../asyncapi/parse";
import { AsyncAPIV2 } from "../asyncapi/v2";
import { loadOpenAPI } from "../loadOpenAPI";
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
    disableExamples,
    taskContext
}: {
    absolutePathToAsyncAPI: AbsoluteFilePath | undefined;
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
    disableExamples: boolean | undefined;
    taskContext: TaskContext;
}): Promise<OpenApiIntermediateRepresentation> {
    let parsedAsyncAPI: AsyncAPIIntermediateRepresentation = {
        schemas: {},
        channel: undefined
    };
    if (absolutePathToAsyncAPI != null) {
        const asyncAPI = await loadAsyncAPI(absolutePathToAsyncAPI);
        parsedAsyncAPI = parseAsyncAPI({ document: asyncAPI, taskContext });
    }

    const openApiDocument = await loadOpenAPI({
        absolutePathToOpenAPI,
        context: taskContext,
        absolutePathToOpenAPIOverrides
    });
    let openApiIr: OpenApiIntermediateRepresentation | undefined = undefined;
    if (isOpenApiV3(openApiDocument)) {
        openApiIr = generateIrFromV3({
            openApi: openApiDocument,
            taskContext,
            disableExamples
        });
    } else if (isOpenApiV2(openApiDocument)) {
        openApiIr = await generateIrFromV2({
            openApi: openApiDocument,
            taskContext,
            disableExamples
        });
    }

    if (openApiIr != null) {
        return {
            ...openApiIr,
            channel: parsedAsyncAPI.channel != null ? [parsedAsyncAPI.channel] : [],
            schemas: {
                ...openApiIr.schemas,
                ...parsedAsyncAPI.schemas
            }
        };
    }

    return taskContext.failAndThrow("Only OpenAPI V3 and V2 Documents are supported.");
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
