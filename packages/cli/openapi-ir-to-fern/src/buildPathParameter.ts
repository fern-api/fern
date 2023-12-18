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
    if (pathParameter.variableReference == null && pathParameter.description == null) {
        return getTypeFromTypeReference(typeReference);
    }
    const pathParameterSchema: RawSchemas.HttpPathParameterSchema =
        pathParameter.variableReference != null
            ? {
                  variable: `$${pathParameter.variableReference}`
              }
            : {
                  type: getTypeFromTypeReference(typeReference)
              };

    if (pathParameter.description != null) {
        pathParameterSchema.docs = pathParameter.description;
    }
    return pathParameterSchema;
}
