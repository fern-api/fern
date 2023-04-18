import { Header, PathParameter, PrimitiveSchemaValue, QueryParameter, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { convertSchema } from "../convertSchemas";

export interface ConvertedParameters {
    pathParameters: PathParameter[];
    queryParameters: QueryParameter[];
    headers: Header[];
}

export function convertParameters(
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
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

        const schema =
            parameter.schema != null
                ? convertSchema(parameter.schema)
                : Schema.primitive({ schema: PrimitiveSchemaValue.string(), description: undefined });

        const convertedParameter = {
            name: parameter.name,
            schema: parameter.required ? schema : Schema.optional({ value: schema, description: undefined }),
            description: undefined,
        };
        if (parameter.in === "query") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else if (parameter.in === "path") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else if (parameter.in === "header") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else {
            throw new Error(`Doesn't support converting this path parameters: ${JSON.stringify(parameter)}`);
        }
    }
    return convertedParameters;
}
