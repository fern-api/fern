import {
    HeaderWithExample,
    HttpMethod,
    LiteralSchemaValue,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    QueryParameterWithExample,
    SchemaWithExample
} from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../../../../schema/convertSchemas";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { getParameterName } from "../../extensions/getParameterName";
import { getVariableReference } from "../../extensions/getVariableReference";
import { getExamplesString } from "../../../../schema/examples/getExample";

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
    requestBreadcrumbs
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
        headers: []
    };
    for (const parameter of parameters) {
        const resolvedParameter = isReferenceObject(parameter)
            ? context.resolveParameterReference(parameter)
            : parameter;

        const isRequired = resolvedParameter.required ?? false;

        const parameterBreadcrumbs = [...requestBreadcrumbs, resolvedParameter.name];
        const generatedName = getGeneratedTypeName(parameterBreadcrumbs);

        let schema =
            resolvedParameter.schema != null
                ? convertSchema(resolvedParameter.schema, !isRequired, context, parameterBreadcrumbs)
                : isRequired
                ? SchemaWithExample.primitive({
                      nameOverride: undefined,
                      generatedName,
                      schema: PrimitiveSchemaValueWithExample.string({
                          minLength: undefined,
                          maxLength: undefined,
                          example: getExamplesString(resolvedParameter.example)
                      }),
                      description: undefined,
                      groupName: undefined
                  })
                : SchemaWithExample.optional({
                      nameOverride: undefined,
                      generatedName,
                      value: SchemaWithExample.primitive({
                          nameOverride: undefined,
                          generatedName,
                          schema: PrimitiveSchemaValueWithExample.string({
                              minLength: undefined,
                              maxLength: undefined,
                              example: getExamplesString(resolvedParameter.example)
                          }),
                          description: undefined,
                          groupName: undefined
                      }),
                      description: undefined,
                      groupName: undefined
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
                    nameOverride: undefined,
                    generatedName,
                    value: LiteralSchemaValue.string(defaultValue),
                    description: undefined,
                    groupName: undefined
                });
            }
        }

        const convertedParameter = {
            name: resolvedParameter.name,
            schema,
            description: resolvedParameter.description,
            parameterNameOverride: getParameterName(resolvedParameter)
        };
        if (resolvedParameter.in === "query") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else if (resolvedParameter.in === "path") {
            convertedParameters.pathParameters.push({
                ...convertedParameter,
                variableReference: getVariableReference(resolvedParameter)
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
    "X-Ping-Custom-Domain"
]);
