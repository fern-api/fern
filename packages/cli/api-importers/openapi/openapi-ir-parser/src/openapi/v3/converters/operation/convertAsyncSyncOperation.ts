import { OpenAPIV3 } from "openapi-types";

import { EndpointWithExample, LiteralSchemaValue, SchemaWithExample, Source } from "@fern-api/openapi-ir";

import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { AsyncFernExtensionSchema } from "../../extensions/getFernAsyncExtension";
import { OperationContext } from "../contexts";
import { convertHttpOperation } from "./convertHttpOperation";

export interface AsyncAndSyncEndpoints {
    async: EndpointWithExample;
    sync: EndpointWithExample;
}

export function convertAsyncSyncOperation({
    operationContext,
    context,
    asyncExtension,
    source
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    asyncExtension: AsyncFernExtensionSchema;
    source: Source;
}): AsyncAndSyncEndpoints {
    const { operation, pathItemParameters, operationParameters } = operationContext;

    const headerToIgnore = asyncExtension.discriminant.name;
    const headerValue = asyncExtension.discriminant.value;
    const asyncResponseStatusCode = asyncExtension["response-status-code"];

    const filteredPathItemParams = filterParameters({ context, headerToIgnore, parameters: pathItemParameters });
    const filteredOperationParams = filterParameters({ context, headerToIgnore, parameters: operationParameters });

    const syncOperation = convertHttpOperation({
        operationContext: {
            ...operationContext,
            pathItemParameters: filteredPathItemParams,
            operationParameters: filteredOperationParams,
            operation: {
                ...operation,
                responses: Object.fromEntries(
                    Object.entries(operation.responses).filter(([statusCode]) => {
                        return parseInt(statusCode) !== asyncResponseStatusCode;
                    })
                )
            }
        },
        context,
        streamFormat: undefined,
        source
    });

    const asyncOperation = convertHttpOperation({
        operationContext: {
            ...operationContext,
            pathItemParameters: filteredPathItemParams,
            operationParameters: filteredOperationParams,
            baseBreadcrumbs: [...operationContext.baseBreadcrumbs, "async"]
        },
        context,
        suffix: "async",
        responseStatusCode: asyncResponseStatusCode,
        streamFormat: undefined,
        source
    });

    asyncOperation.headers.push({
        name: headerToIgnore,
        schema: SchemaWithExample.literal({
            nameOverride: undefined,
            generatedName: getGeneratedTypeName([headerToIgnore], context.options.preserveSchemaIds),
            title: undefined,
            description: undefined,
            availability: undefined,
            value: LiteralSchemaValue.string(headerValue),
            groupName: undefined
        }),
        description: undefined,
        parameterNameOverride: undefined,
        env: undefined,
        availability: undefined,
        source
    });

    return {
        sync: syncOperation,
        async: asyncOperation
    };
}

function filterParameters({
    context,
    headerToIgnore,
    parameters
}: {
    context: AbstractOpenAPIV3ParserContext;
    headerToIgnore: string;
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
}): (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] {
    return parameters.filter((parameter) => {
        const resolvedParameter = isReferenceObject(parameter)
            ? context.resolveParameterReference(parameter)
            : parameter;
        if (resolvedParameter.in === "header" && resolvedParameter.name === headerToIgnore) {
            return false;
        }
        return true;
    });
}
