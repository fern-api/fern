import { OpenAPIV3 } from "openapi-types";

import {
    HeaderWithExample,
    HttpMethod,
    LiteralSchemaValue,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    QueryParameterWithExample,
    SchemaWithExample,
    Source
} from "@fern-api/openapi-ir";

import { getExtension } from "../../../../getExtension";
import { convertAvailability } from "../../../../schema/convertAvailability";
import { convertSchema } from "../../../../schema/convertSchemas";
import { getExamplesString } from "../../../../schema/examples/getExample";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
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
    requestBreadcrumbs,
    source
}: {
    path: string;
    httpMethod: HttpMethod;
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
    context: AbstractOpenAPIV3ParserContext;
    requestBreadcrumbs: string[];
    source: Source;
}): ConvertedParameters {
    const convertedParameters: ConvertedParameters = {
        pathParameters: [],
        queryParameters: [],
        headers: []
    };
    for (const parameter of parameters) {
        const shouldIgnore = getExtension<boolean>(parameter, FernOpenAPIExtension.IGNORE);
        if (shouldIgnore != null && shouldIgnore) {
            context.logger.debug(
                `${httpMethod.toUpperCase()} ${path} has a parameter marked with x-fern-ignore. Skipping.`
            );
            continue;
        }

        const resolvedParameter = isReferenceObject(parameter)
            ? context.resolveParameterReference(parameter)
            : parameter;

        const isRequired = resolvedParameter.required ?? false;
        const availability = convertAvailability(resolvedParameter);

        const parameterBreadcrumbs = [...requestBreadcrumbs, resolvedParameter.name];
        const generatedName = getGeneratedTypeName(parameterBreadcrumbs, context.options.preserveSchemaIds);

        let schema =
            resolvedParameter.schema != null
                ? convertSchema(
                      resolvedParameter.schema,
                      !isRequired,
                      context,
                      parameterBreadcrumbs,
                      source,
                      context.namespace,
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
                        title: undefined,
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
                        title: undefined,
                        value: SchemaWithExample.primitive({
                            nameOverride: undefined,
                            generatedName,
                            title: undefined,
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
                        groupName: undefined,
                        inline: undefined
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
                    title: undefined,
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
            availability,
            source
        };
        if (resolvedParameter.in === "query") {
            convertedParameters.queryParameters.push(convertedParameter);
        } else if (resolvedParameter.in === "path") {
            convertedParameters.pathParameters.push({
                ...convertedParameter,
                variableReference: getVariableReference(resolvedParameter)
            });
        } else if (resolvedParameter.in === "header") {
            if (
                !HEADERS_TO_SKIP.has(resolvedParameter.name.toLowerCase()) &&
                !context.authHeaders.has(resolvedParameter.name)
            ) {
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
    "user-agent",
    "content-length",
    "content-type",
    "x-forwarded-for",
    "cookie",
    "origin",
    "content-disposition",
    "x-ping-custom-domain"
]);
