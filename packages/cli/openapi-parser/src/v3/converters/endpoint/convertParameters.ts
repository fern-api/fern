import { Header, PathParameter, PrimitiveSchemaValue, QueryParameter, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema } from "../convertSchemas";

export interface ConvertedParameters {
    pathParameters: PathParameter[];
    queryParameters: QueryParameter[];
    headers: Header[];
}

export function convertParameters(
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[],
    context: OpenAPIV3ParserContext,
    requestBreadcrumbs: string[]
): ConvertedParameters {
    const convertedParameters: ConvertedParameters = {
        pathParameters: [],
        queryParameters: [],
        headers: [],
    };
    for (const parameter of parameters) {
        const resolvedParameter = isReferenceObject(parameter)
            ? context.resolveParameterReference(parameter)
            : parameter;

        const isRequired = resolvedParameter.required ?? false;
        const schema =
            resolvedParameter.schema != null
                ? convertSchema(resolvedParameter.schema, !isRequired, context, [
                      ...requestBreadcrumbs,
                      resolvedParameter.name,
                  ])
                : isRequired
                ? Schema.primitive({
                      schema: PrimitiveSchemaValue.string(),
                      description: undefined,
                  })
                : Schema.optional({
                      value: Schema.primitive({ schema: PrimitiveSchemaValue.string(), description: undefined }),
                      description: undefined,
                  });

        const convertedParameter = {
            name: resolvedParameter.name,
            schema,
            description: resolvedParameter.description,
        };
        if (resolvedParameter.in === "query") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else if (resolvedParameter.in === "path") {
            convertedParameters.pathParameters.push(convertedParameter);
        } else if (resolvedParameter.in === "header") {
            convertedParameters.headers.push(convertedParameter);
        } else {
            throw new Error(`Doesn't support converting this path parameters: ${JSON.stringify(parameter)}`);
        }
    }
    return convertedParameters;
}
