import { Header, PathParameter, PrimitiveSchemaValue, QueryParameter, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export interface ConvertedParameters {
    pathParameters: PathParameter[];
    queryParameters: QueryParameter[];
    headers: Header[];
}

export function convertParameters(
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[],
    context: OpenAPIV3ParserContext
): ConvertedParameters {
    const convertedParameters: ConvertedParameters = {
        pathParameters: [],
        queryParameters: [],
        headers: [],
    };
    for (const parameter of parameters) {
        if (isReferenceObject(parameter)) {
            throw new Error(`Converting referenced parameters is unsupported: ${JSON.stringify(parameter)}`);
        }

        const isRequired = parameter.required ?? false;
        const schema =
            parameter.schema != null
                ? convertSchema(parameter.schema, !isRequired, context)
                : isRequired
                ? Schema.primitive({ schema: PrimitiveSchemaValue.string(), description: parameter.description })
                : Schema.optional({
                      value: Schema.primitive({ schema: PrimitiveSchemaValue.string(), description: undefined }),
                      description: parameter.description,
                  });

        const convertedParameter = {
            name: parameter.name,
            schema,
            description: undefined,
        };
        if (parameter.in === "query") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else if (parameter.in === "path") {
            convertedParameters.pathParameters.push(convertedParameter);
        } else if (parameter.in === "header") {
            convertedParameters.headers.push(convertedParameter);
        } else {
            throw new Error(`Doesn't support converting this path parameters: ${JSON.stringify(parameter)}`);
        }
    }
    return convertedParameters;
}
