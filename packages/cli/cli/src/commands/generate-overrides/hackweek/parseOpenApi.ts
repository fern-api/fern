import { HttpMethod } from "@fern-api/openapi-ir";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import { parseOpenAPI } from "@fern-api/openapi-ir-parser";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

// This is a little duplicative of what we do in the OAI IR generation, but the OpenAPI IR is just way too large to send.
export async function parseApiSpec(absolutePathToOpenAPI: AbsoluteFilePath): Promise<OpenAPIV3.Document> {
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

// The swagger2openapi library isn't compiling well with the CLI, so not supporting it right now
// function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
//     // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
//     return (openApi as OpenAPIV2.Document).swagger != null;
// }

export function getOperationObjectsFromPathItem(
    pathItemObject: OpenAPIV3.PathItemObject
): Map<HttpMethod, OpenAPIV3.OperationObject> {
    const operations = new Map<HttpMethod, OpenAPIV3.OperationObject>();

    if (pathItemObject.get != null) {
        operations.set(HttpMethod.Get, pathItemObject.get);
    }

    if (pathItemObject.post != null) {
        operations.set(HttpMethod.Post, pathItemObject.post);
    }

    if (pathItemObject.put != null) {
        operations.set(HttpMethod.Put, pathItemObject.put);
    }

    if (pathItemObject.delete != null) {
        operations.set(HttpMethod.Delete, pathItemObject.delete);
    }

    if (pathItemObject.patch != null) {
        operations.set(HttpMethod.Patch, pathItemObject.patch);
    }

    return operations;
}
