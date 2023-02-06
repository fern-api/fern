import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { OpenAPIConverter } from "./v3/OpenApiV3Converter";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
}

export async function convertOpenApi({
    openApiPath,
    taskContext,
}: {
    openApiPath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<OpenApiConvertedFernDefinition | undefined> {
    taskContext.logger.debug(`Reading ${openApiPath}`);
    const openApiDocument = await SwaggerParser.parse(openApiPath);
    if (isOpenApiV3(openApiDocument)) {
        const openApiV3Converter = new OpenAPIConverter(openApiDocument, taskContext);
        return openApiV3Converter.convert();
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
