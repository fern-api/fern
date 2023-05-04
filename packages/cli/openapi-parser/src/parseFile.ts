import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { generateIr as generateIrFromV2 } from "./v2/generateIr";
import { generateIr as generateIrFromV3 } from "./v3/generateIr";

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
            file: generateIrFromV3(openApiDocument, taskContext),
        };
    } else if (isOpenApiV2(openApiDocument)) {
        return {
            id,
            file: await generateIrFromV2(openApiDocument, taskContext),
        };
    }
    return taskContext.failAndThrow("Only OpenAPI V3 and V2 Documents are supported.");
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV2.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
