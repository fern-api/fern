import { RelativeFilePath } from "@fern-api/fs-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { buildFernDefinition } from "./buildFernDefinition";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    packageMarkerFile: PackageMarkerFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert({
    openApiIr,
    taskContext
}: {
    taskContext: TaskContext;
    openApiIr: OpenApiIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    const context = new OpenApiIrConverterContext({ taskContext, ir: openApiIr });
    return buildFernDefinition(context);
}
