import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { encodingForModel, TiktokenModel } from "js-tiktoken";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { parseOpenAPI } from "@fern-api/openapi-ir-parser/src/loadOpenAPI";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";

export function tokenize({
    input,
    getNextChunk,
    tokensPerChunk,
    model = "gpt-4o-mini"
}: {
    input: string;
    getNextChunk: (remainingInput: string) => string;
    tokensPerChunk: number;
    model?: TiktokenModel;
}): string[] {
    const tokenEncoding = encodingForModel(model);
    const tokens: string[] = [];
    let currentChunk = "";

    while (input.length > 0) {
        const chunk = getNextChunk(input);
        const chunkTokens = tokenEncoding.encode(chunk).length;
        const currentChunkTokens = tokenEncoding.encode(currentChunk).length;

        // If you'll go over the token limit, push the current chunk and start a new one
        if (chunkTokens + currentChunkTokens > tokensPerChunk) {
            tokens.push(currentChunk);
            currentChunk = chunk;
        } else {
            currentChunk += chunk;
        }

        input = input.slice(chunk.length);
    }

    return tokens;
}

export function tokenizeIREndpoints({
    ir,
    tokensPerChunk,
    model = "gpt-4o-mini"
}: {
    ir: OpenApiIntermediateRepresentation;
    tokensPerChunk: number;
    model?: TiktokenModel;
}): string[] {
    // TODO: we should pare back the endpoint data model to not overwhelm the model with unnecessary data
    const tokenEncoding = encodingForModel(model);
    const tokens: string[] = [];
    let currentChunk = "";

    for (const endpoint of ir.endpoints) {
        const endpointString = JSON.stringify(endpoint);
        const endpointTokens = tokenEncoding.encode(endpointString).length;
        const currentChunkTokens = tokenEncoding.encode(currentChunk).length;

        if (endpointTokens + currentChunkTokens > tokensPerChunk) {
            tokens.push(currentChunk);
            currentChunk = endpointString;
        } else {
            currentChunk += endpointString;
        }
    }

    tokens.push(currentChunk);

    return tokens;
}

export async function tokenizeOpenApiSpec({
    absolutePathToOpenAPI,
    tokensPerChunk,
    model = "gpt-4o-mini",
    path
}: {
    absolutePathToOpenAPI: AbsoluteFilePath;
    tokensPerChunk: number;
    model?: TiktokenModel;
    path: AbsoluteFilePath;
}): Promise<{ stringifiedEndpoints: string; numEndpointsInChunk: number }[]> {
    const openApiDocument = await parseApiSpec(absolutePathToOpenAPI);
    const tokenEncoding = encodingForModel(model);
    const tokens: { stringifiedEndpoints: string; numEndpointsInChunk: number }[] = [];
    let currentChunk: { paths: Record<string, Record<string, unknown>> } = { paths: {} };

    let numEndpointsInChunk = 0;
    for (const [path, pathObject] of Object.entries(openApiDocument.paths ?? {})) {
        const currentChunkAndNewEndpoint = { ...currentChunk };
        // If the path is already in the current chunk, merge the two objects (which are records of the methods on the path)
        if (path in currentChunkAndNewEndpoint.paths) {
            currentChunkAndNewEndpoint.paths[path] = { ...currentChunkAndNewEndpoint.paths[path]!, ...pathObject };
        }
        currentChunkAndNewEndpoint.paths[path] = pathObject!;
        const currentChunkAndNewEndpointString = JSON.stringify(currentChunkAndNewEndpoint, null, 2);
        const currentChunkAndNewEndpointTokens = tokenEncoding.encode(currentChunkAndNewEndpointString).length;

        if (currentChunkAndNewEndpointTokens > tokensPerChunk) {
            tokens.push({ stringifiedEndpoints: JSON.stringify(currentChunk), numEndpointsInChunk });
            // Reset with only the new endpoint
            currentChunk = { paths: { [path]: pathObject! } };
            numEndpointsInChunk = 1;
        } else {
            // Add the new endpoint to the current chunk, which we already did to check if it's too large
            currentChunk = currentChunkAndNewEndpoint;
            numEndpointsInChunk++;
        }
    }

    tokens.push({ stringifiedEndpoints: JSON.stringify(currentChunk, null, 2), numEndpointsInChunk });

    await writeFile(join(dirname(path), RelativeFilePath.of("spliced-overrides.json")), JSON.stringify(currentChunk));

    return tokens;
}

// This is a little duplicative of what we do in the OAI IR generation, but the OpenAPI IR is just way too large to send.
async function parseApiSpec(absolutePathToOpenAPI: AbsoluteFilePath): Promise<OpenAPIV3.Document> {
    const openApiDocument = await parseOpenAPI({
        absolutePathToOpenAPI
    });

    if (isOpenApiV3(openApiDocument)) {
        return openApiDocument;
    }

    throw new Error("Invalid OpenAPI document");
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
