import { RawSchemas } from "@fern-api/fern-definition-schema";
import { PathParameter } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildTypeReference } from "./buildTypeReference.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { convertAvailability } from "./utils/convertAvailability.js";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference.js";

export function buildPathParameter({
    pathParameter,
    context,
    fileContainingReference,
    namespace
}: {
    pathParameter: PathParameter;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
    namespace: string | undefined;
}): RawSchemas.HttpPathParameterSchema {
    const typeReference = buildTypeReference({
        schema: pathParameter.schema,
        context,
        fileContainingReference,
        namespace,
        declarationDepth: 0
    });
    if (
        pathParameter.variableReference == null &&
        pathParameter.description == null &&
        pathParameter.availability == null &&
        pathParameter.clientDefault == null
    ) {
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
    if (pathParameter.availability != null) {
        pathParameterSchema.availability = convertAvailability(pathParameter.availability);
    }
    if (pathParameter.clientDefault != null && "type" in pathParameterSchema) {
        pathParameterSchema["client-default"] = pathParameter.clientDefault;
    }

    return pathParameterSchema;
}
