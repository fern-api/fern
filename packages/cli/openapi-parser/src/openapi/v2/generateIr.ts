import { OpenApiIntermediateRepresentation, Source } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV2 } from "openapi-types";
import { convertObj } from "swagger2openapi";
import { ParseOpenAPIOptions } from "../../options";
import { generateIr as generateIrFromV3 } from "../v3/generateIr";

export async function generateIr({
    openApi,
    taskContext,
    options,
    source
}: {
    openApi: OpenAPIV2.Document;
    taskContext: TaskContext;
    options: ParseOpenAPIOptions;
    source: Source;
}): Promise<OpenApiIntermediateRepresentation> {
    const conversionResult = await convertObj(openApi, {});
    return generateIrFromV3({
        openApi: conversionResult.openapi,
        taskContext,
        options,
        source
    });
}
