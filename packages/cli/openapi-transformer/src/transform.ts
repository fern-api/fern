import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { lint } from "./linter/lint";

export async function transform({
    openApiPath,
    taskContext,
}: {
    openApiPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<void> {
    const raw = await readFile(openApiPath);
    const document = await SwaggerParser.parse(openApiPath);
    if (isOpenApiV3(document)) {
        await lint({
            context: taskContext,
            document,
            rawContents: raw.toString(),
            format: openApiPath.endsWith("yaml") ? "yaml" : "json",
        });
    } else {
        taskContext.failAndThrow(
            `Only OpenAPI V3 Documents are supported. ${isOpenApiV2(document) ? "Received V2 instead." : ""}`
        );
    }
}

export function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

export function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
