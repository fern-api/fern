import {
    Header,
    HttpMethod,
    PathParameter,
    PrimitiveSchemaValue,
    QueryParameter,
    Schema,
} from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { getVariableReference } from "../../extensions/getVariableReference";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema } from "../convertSchemas";

export interface ConvertedParameters {
    pathParameters: PathParameter[];
    queryParameters: QueryParameter[];
    headers: Header[];
}

export function convertParameters({
    path,
    httpMethod,
    parameters,
    context,
    requestBreadcrumbs,
}: {
    path: string;
    httpMethod: HttpMethod;
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
    context: AbstractOpenAPIV3ParserContext;
    requestBreadcrumbs: string[];
}): ConvertedParameters {
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
                      schema: PrimitiveSchemaValue.string({
                          minLength: undefined,
                          maxLength: undefined,
                      }),
                      description: undefined,
                  })
                : Schema.optional({
                      value: Schema.primitive({
                          schema: PrimitiveSchemaValue.string({
                              minLength: undefined,
                              maxLength: undefined,
                          }),
                          description: undefined,
                      }),
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
            convertedParameters.pathParameters.push({
                ...convertedParameter,
                variableReference: getVariableReference(resolvedParameter),
            });
        } else if (resolvedParameter.in === "header") {
            if (!HEADERS_TO_SKIP.has(resolvedParameter.name) && !context.authHeaders.has(resolvedParameter.name)) {
                convertedParameters.headers.push(convertedParameter);
            } else {
                context.logger.debug(
                    `Ignoring ${resolvedParameter.name} header, in ${httpMethod.toUpperCase()} ${path}`
                );
            }
        } else {
            context.logger.warn(
                `Skipping ${resolvedParameter.in} parameter, ${
                    resolvedParameter.name
                }, in ${httpMethod.toUpperCase()} ${path}`
            );
        }
    }
    return convertedParameters;
}

const HEADERS_TO_SKIP = new Set([
    "User-Agent",
    "Content-Length",
    "Content-Type",
    "X-Forwarded-For",
    "Cookie",
    "Origin",
    "Content-Disposition",
    "X-Ping-Custom-Domain",
]);
