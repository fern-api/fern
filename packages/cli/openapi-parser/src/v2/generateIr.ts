import { TaskContext } from "@fern-api/task-context";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV2 } from "openapi-types";
import { convertObj } from "swagger2openapi";
import { generateIr as generateIrFromV3 } from "../v3/generateIr";

export async function generateIr(
    openApi: OpenAPIV2.Document,
    taskContext: TaskContext
): Promise<OpenAPIIntermediateRepresentation> {
    const conversionResult = await convertObj(openApi, {});
    return generateIrFromV3(conversionResult.openapi, taskContext);
}
