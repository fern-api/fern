import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DefinitionFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/finalIr";
import { convertPackage } from "./convertPackage";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert({
    openApiIr,
    taskContext,
}: {
    taskContext: TaskContext;
    openApiIr: OpenAPIIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    const context = new OpenApiIrConverterContext({ taskContext });
    const convertedPackage = convertPackage({ openApiFile: openApiIr, context });

    return {
        rootApiFile: convertedPackage.rootApiFile,
        definitionFiles: convertedPackage.definitionFiles,
    };
}
