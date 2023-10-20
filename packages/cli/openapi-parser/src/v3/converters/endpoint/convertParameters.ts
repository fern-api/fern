import { HttpMethod } from "@fern-fern/openapi-ir-model/finalIr";
import {
    HeaderWithExample,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    QueryParameterWithExample,
    SchemaWithExample,
} from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { getVariableReference } from "../../extensions/getVariableReference";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema } from "../convertSchemas";
import { getExamplesString } from "../example/getExample";

export interface ConvertedParameters {
    pathParameters: PathParameterWithExample[];
    queryParameters: QueryParameterWithExample[];
    headers: HeaderWithExample[];
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

        let schema =
            resolvedParameter.schema != null
                ? convertSchema(resolvedParameter.schema, !isRequired, context, [
                      ...requestBreadcrumbs,
                      resolvedParameter.name,
                  ])
                : isRequired
                ? SchemaWithExample.primitive({
                      schema: PrimitiveSchemaValueWithExample.string({
                          minLength: undefined,
                          maxLength: undefined,
                          example: getExamplesString(resolvedParameter.example),
                      }),
                      description: undefined,
                  })
                : SchemaWithExample.optional({
                      value: SchemaWithExample.primitive({
                          schema: PrimitiveSchemaValueWithExample.string({
                              minLength: undefined,
                              maxLength: undefined,
                              example: getExamplesString(resolvedParameter.example),
                          }),
                          description: undefined,
                      }),
                      description: undefined,
                  });
        if (
            resolvedParameter.in === "header" &&
            resolvedParameter.schema != null &&
            !isReferenceObject(resolvedParameter.schema) &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (resolvedParameter.schema as any).default != null
        ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const defaultValue = (resolvedParameter.schema as any).default;
            if (typeof defaultValue === "string" && defaultValue.length > 0) {
                schema = SchemaWithExample.literal({
                    value: defaultValue,
                    description: undefined,
                });
            }
        }

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
