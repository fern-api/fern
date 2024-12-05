import { OpenApiIntermediateRepresentation, Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV2 } from "openapi-types";
import { ParseOpenAPIOptions } from "../../options";
import { generateIr as generateIrFromV3 } from "../v3/generateIr";

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

export async function generateIr({
    openApi,
    taskContext,
    options,
    source,
    namespace
}: {
    openApi: OpenAPIV2.Document;
    taskContext: TaskContext;
    options: ParseOpenAPIOptions;
    source: Source;
    namespace: string | undefined;
}): Promise<OpenApiIntermediateRepresentation> {
    if (isBrowser) {
        throw new Error("Swagger 2.0 is not supported in the browser");
    }
    const swagger2openapi = await import("swagger2openapi");
    const conversionResult = await swagger2openapi.convertObj(openApi, {});
    return generateIrFromV3({
        openApi: conversionResult.openapi,
        taskContext,
        options,
        source,
        namespace
    });
}
