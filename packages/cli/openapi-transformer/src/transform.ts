import SwaggerParser from "@apidevtools/swagger-parser";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIWorkspace } from "@fern-api/workspace-loader";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { validateOpenAPIWorkspace } from "./validator/validateOpenAPIWorkspace";

export async function transform({
    workspace,
    taskContext,
}: {
    workspace: OpenAPIWorkspace;
    taskContext: TaskContext;
}): Promise<void> {
    const document = await SwaggerParser.parse(workspace.definition.contents);
    if (isOpenApiV3(document)) {
        await validateOpenAPIWorkspace(workspace);
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
