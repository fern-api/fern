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
import { convertAvailability } from "../../../../schema/convertAvailability";
import { convertSchema } from "../../../../schema/convertSchemas";
import { getExamplesString } from "../../../../schema/examples/getExample";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { getParameterName } from "../../extensions/getParameterName";
import { getVariableReference } from "../../extensions/getVariableReference";

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
        const availability = convertAvailability(resolvedParameter);

        const parameterBreadcrumbs = [...requestBreadcrumbs, resolvedParameter.name];
        const generatedName = getGeneratedTypeName(parameterBreadcrumbs);

        if (getExamplesString({ schema: resolvedParameter, logger: context.logger })?.includes(" ")) {
            context.logger.warn(
                "Parameter example contains a space, which is ambiguous. Consider using enums for multiple examples, or use an encoding if a space is part of the parameter."
            );
        }

        let schema =
            resolvedParameter.schema != null
                ? convertSchema(
                      resolvedParameter.schema,
                      !isRequired,
                      context,
                      parameterBreadcrumbs,
                      false,
                      new Set(),
                      getExamplesString({
                          schema: resolvedParameter,
                          logger: context.logger
                      })
                  )
                : isRequired
                ? SchemaWithExample.primitive({
                      nameOverride: undefined,
                      generatedName,
                      schema: PrimitiveSchemaValueWithExample.string({
                          default: undefined,
                          pattern: undefined,
                          format: undefined,
                          minLength: undefined,
                          maxLength: undefined,
                          example: getExamplesString({
                              schema: resolvedParameter,
                              logger: context.logger
                          })
                      }),
                      description: undefined,
                      availability,
                      groupName: undefined
                  })
                : SchemaWithExample.optional({
                      nameOverride: undefined,
                      generatedName,
                      value: SchemaWithExample.primitive({
                          nameOverride: undefined,
                          generatedName,
                          schema: PrimitiveSchemaValueWithExample.string({
                              default: undefined,
                              pattern: undefined,
                              format: undefined,
                              minLength: undefined,
                              maxLength: undefined,
                              example: getExamplesString({
                                  schema: resolvedParameter,
                                  logger: context.logger
                              })
                          }),
                          description: undefined,
                          availability: undefined,
                          groupName: undefined
                      }),
                      description: undefined,
                      availability,
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
                    availability,
                    groupName: undefined
                });
            }
        }

        const convertedParameter = {
            name: resolvedParameter.name,
            schema,
            description: resolvedParameter.description,
            parameterNameOverride: getParameterName(resolvedParameter),
            availability
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
                convertedParameters.headers.push({ ...convertedParameter, env: undefined });
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
