import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { generateIr } from "./v3/generateIr";

export interface ParsedFile {
    id: string;
    file: OpenAPIFile;
}

export async function parseFile({
    taskContext,
    relativeFilepath,
    absoluteFilePath,
}: {
    taskContext: TaskContext;
    relativeFilepath: RelativeFilePath;
    absoluteFilePath: AbsoluteFilePath;
}): Promise<ParsedFile> {
    const openApiDocument = await SwaggerParser.parse(absoluteFilePath);
    const id = relativeFilepath;
    if (isOpenApiV3(openApiDocument)) {
        return {
            id,
            file: generateIr(openApiDocument, taskContext),
        };
    }
    return taskContext.failAndThrow(
        `Only OpenAPI V3 Documents are supported. ${isOpenApiV2(openApiDocument) ? "Received V2 instead." : ""}`
    );
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
