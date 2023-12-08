import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { PathParameter } from "@fern-fern/openapi-ir-model/finalIr";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildPathParameter({
    pathParameter,
    context,
    fileContainingReference
}: {
    pathParameter: PathParameter;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
}): RawSchemas.HttpPathParameterSchema {
    const typeReference = buildTypeReference({
        schema: pathParameter.schema,
        context,
        fileContainingReference
    });
    return pathParameter.variableReference != null
        ? {
              docs: pathParameter.description ?? undefined,
              variable: `$${pathParameter.variableReference}`
          }
        : {
              docs: pathParameter.description ?? undefined,
              type: getTypeFromTypeReference(typeReference)
          };
}
