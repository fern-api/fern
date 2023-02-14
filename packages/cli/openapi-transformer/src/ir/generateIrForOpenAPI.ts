import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { generateIrForOpenAPIV3 } from "./v3/generateIrForOpenAPIV3";

export async function generateIrForOpenAPI({
    openApiPath,
    taskContext,
}: {
    openApiPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<FernOpenapiIr.IntermediateRepresentation | undefined> {
    taskContext.logger.debug(`Reading ${openApiPath}`);
    const openApiDocument = await SwaggerParser.parse(openApiPath);
    if (isOpenApiV3(openApiDocument)) {
        return generateIrForOpenAPIV3({ document: openApiDocument, taskContext });
    }
    taskContext.failAndThrow(
        `Only OpenAPI V3 Documents are supported. ${isOpenApiV2(openApiDocument) ? "Received V2 instead." : ""}`
    );
    return undefined;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}

function isOpenApiV2(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV2.Document).swagger != null;
}
