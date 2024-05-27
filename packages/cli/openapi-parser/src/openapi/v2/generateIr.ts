import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV2 } from "openapi-types";
import { convertObj } from "swagger2openapi";
import { generateIr as generateIrFromV3 } from "../v3/generateIr";

export async function generateIr({
    openApi,
    taskContext,
    disableExamples,
    audiences,
    shouldUseTitleAsName
}: {
    openApi: OpenAPIV2.Document;
    taskContext: TaskContext;
    disableExamples: boolean | undefined;
    audiences: string[];
    shouldUseTitleAsName: boolean;
}): Promise<OpenApiIntermediateRepresentation> {
    const conversionResult = await convertObj(openApi, {});
    return generateIrFromV3({
        openApi: conversionResult.openapi,
        taskContext,
        disableExamples,
        audiences,
        shouldUseTitleAsName
    });
}
